import {
  Database,
  getTablePrimaryKey,
  type DataManipulationOperation,
  type DataManipulationRequest,
  type DataManipulationResult,
  type DatabaseDriver,
  type DatabaseOptions,
  type SqlStatement,
  type TableRef,
  type TransactionOptions,
  type TransactionToken,
} from 'remix/data-table';

import { compileSqliteOperation } from './sql-compiler.ts';

type D1DatabaseClient = Env['DB'];
type D1Value = ArrayBuffer | number | string | null;

const d1Capabilities = Object.freeze({
  returning: true,
  savepoints: false,
  upsert: true,
  transactionalDdl: false,
  migrationLock: false,
});
/**
 * `DatabaseDriver` for Cloudflare D1.
 *
 * D1 does not support interactive `BEGIN` / `SAVEPOINT` through Worker bindings,
 * so `db.transaction()` is unsupported. Prefer single statements or `batch()`
 * at the binding level when you need atomic multi-statement writes.
 *
 * The D1 binding is caller-owned: `close()` is a no-op and `wipe()` is
 * unavailable, matching sqlite's supplied-client lifecycle.
 */
class D1DatabaseDriver implements DatabaseDriver<'d1'> {
  get dialect(): 'd1' {
    return 'd1';
  }

  get capabilities() {
    return d1Capabilities;
  }

  #database: D1DatabaseClient;

  constructor(database: D1DatabaseClient) {
    this.#database = database;
  }

  compileSql(operation: DataManipulationOperation): SqlStatement[] {
    const compiled = compileSqliteOperation(operation);
    return [{ text: compiled.text, values: compiled.values }];
  }

  async execute(
    request: DataManipulationRequest,
  ): Promise<DataManipulationResult> {
    if (request.transaction) {
      throwUnknownTransaction(request.transaction);
    }

    if (
      request.operation.kind === 'insertMany' &&
      request.operation.values.length === 0
    ) {
      return {
        affectedRows: 0,
        insertId: undefined,
        rows: request.operation.returning ? [] : undefined,
      };
    }

    const statement = this.compileSql(request.operation)[0]!;
    const result = await this.#database
      .prepare(statement.text)
      .bind(...normalizeStatementValues(statement.values))
      .run<Record<string, unknown>>();

    let rows = normalizeRows(result.results ?? []);

    if (
      request.operation.kind === 'count' ||
      request.operation.kind === 'exists'
    ) {
      rows = normalizeCountRows(rows);
    }

    return {
      rows: shouldReturnRows(request.operation, rows) ? rows : undefined,
      affectedRows: normalizeAffectedRows(request.operation.kind, result, rows),
      insertId: normalizeInsertId(request.operation, result, rows),
    };
  }

  async executeScript(
    sql: string,
    transaction?: TransactionToken,
  ): Promise<void> {
    if (transaction) {
      throwUnknownTransaction(transaction);
    }

    await this.#database.exec(sql);
  }

  async hasTable(
    table: TableRef,
    transaction?: TransactionToken,
  ): Promise<boolean> {
    if (transaction) {
      throwUnknownTransaction(transaction);
    }

    const masterTable = table.schema
      ? quoteIdentifier(table.schema) + '.sqlite_master'
      : 'sqlite_master';
    const result = await this.#database
      .prepare(
        'select 1 from ' + masterTable + ' where type = ? and name = ? limit 1',
      )
      .bind('table', table.name)
      .run<Record<string, unknown>>();

    return normalizeRows(result.results ?? []).length > 0;
  }

  async hasColumn(
    table: TableRef,
    column: string,
    transaction?: TransactionToken,
  ): Promise<boolean> {
    if (transaction) {
      throwUnknownTransaction(transaction);
    }

    const schemaPrefix = table.schema
      ? quoteIdentifier(table.schema) + '.'
      : '';
    const result = await this.#database
      .prepare(
        'pragma ' +
          schemaPrefix +
          'table_info(' +
          quoteIdentifier(table.name) +
          ')',
      )
      .run<Record<string, unknown>>();

    return normalizeRows(result.results ?? []).some(
      (row) => row.name === column,
    );
  }

  async beginTransaction(
    _options?: TransactionOptions,
  ): Promise<TransactionToken> {
    throw new Error(
      'D1Database does not support data-table interactive transactions',
    );
  }

  async commitTransaction(token: TransactionToken): Promise<void> {
    throwUnknownTransaction(token);
  }

  async rollbackTransaction(token: TransactionToken): Promise<void> {
    throwUnknownTransaction(token);
  }

  async createSavepoint(token: TransactionToken, _name: string): Promise<void> {
    throwUnknownTransaction(token);
  }

  async rollbackToSavepoint(
    token: TransactionToken,
    _name: string,
  ): Promise<void> {
    throwUnknownTransaction(token);
  }

  async releaseSavepoint(
    token: TransactionToken,
    _name: string,
  ): Promise<void> {
    throwUnknownTransaction(token);
  }

  async wipe(): Promise<void> {
    throw new Error(
      'D1 database wipe() is not supported; the Worker binding is caller-owned',
    );
  }

  close(): void {
    // Supplied D1 bindings remain caller-owned.
  }
}

/** A {@link Database} backed by Cloudflare D1. */
export class D1Database extends Database<'d1'> {
  /**
   * Creates a D1-backed database.
   * @param database Cloudflare D1 Worker binding.
   * @param options Database runtime options.
   */
  constructor(database: D1DatabaseClient, options: DatabaseOptions = {}) {
    super(new D1DatabaseDriver(database), options);
  }
}

/**
 * Creates a Cloudflare D1-backed `Database`.
 *
 * @example
 * ```ts
 * import { createD1Database } from './db/d1.ts';
 *
 * export const db = createD1Database(env.DB, {
 *   now: () => new Date().toISOString(),
 * });
 * ```
 */
export function createD1Database(
  d1: D1DatabaseClient,
  options: DatabaseOptions = {},
): D1Database {
  return new D1Database(d1, options);
}

function normalizeRows(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => {
    if (typeof row !== 'object' || row === null) {
      return {};
    }

    return { ...(row as Record<string, unknown>) };
  });
}

function normalizeStatementValues(values: unknown[]): D1Value[] {
  return values.map(normalizeStatementValue);
}

function normalizeStatementValue(value: unknown): D1Value {
  if (value === undefined) {
    return null;
  }

  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (
    value === null ||
    typeof value === 'number' ||
    typeof value === 'string'
  ) {
    return value;
  }

  if (value instanceof ArrayBuffer) {
    return value;
  }

  throw new TypeError('Unsupported D1 bound value: ' + String(value));
}

function normalizeCountRows(
  rows: Record<string, unknown>[],
): Record<string, unknown>[] {
  return rows.map((row) => {
    const count = row.count;

    if (typeof count === 'string') {
      const numeric = Number(count);

      if (!Number.isNaN(numeric)) {
        return { ...row, count: numeric };
      }
    }

    return row;
  });
}

function shouldReturnRows(
  operation: DataManipulationRequest['operation'],
  rows: Record<string, unknown>[],
): boolean {
  if (
    operation.kind === 'select' ||
    operation.kind === 'count' ||
    operation.kind === 'exists'
  ) {
    return true;
  }

  if (operation.kind === 'raw') {
    return rows.length > 0;
  }

  return operation.returning !== undefined;
}

function normalizeAffectedRows(
  kind: DataManipulationRequest['operation']['kind'],
  result: D1Result<Record<string, unknown>>,
  rows: Record<string, unknown>[],
): number | undefined {
  if (kind === 'select' || kind === 'count' || kind === 'exists') {
    return undefined;
  }

  if (isWriteOperationKind(kind) && rows.length > 0) {
    return rows.length;
  }

  return result.meta.changes;
}

function normalizeInsertId(
  operation: DataManipulationRequest['operation'],
  result: D1Result<Record<string, unknown>>,
  rows: Record<string, unknown>[],
): unknown {
  if (!isInsertOperation(operation)) {
    return undefined;
  }

  const primaryKey = getTablePrimaryKey(operation.table);

  if (primaryKey.length !== 1) {
    return undefined;
  }

  const key = primaryKey[0]!;
  const row = rows[rows.length - 1];

  if (row) {
    return row[key];
  }

  return result.meta.last_row_id;
}

function quoteIdentifier(value: string): string {
  return '"' + value.replace(/"/g, '""') + '"';
}

function throwUnknownTransaction(token: TransactionToken): never {
  throw new Error('Unknown transaction token: ' + token.id);
}

function isWriteOperationKind(
  kind: DataManipulationRequest['operation']['kind'],
): boolean {
  return (
    kind === 'insert' ||
    kind === 'insertMany' ||
    kind === 'update' ||
    kind === 'delete' ||
    kind === 'upsert'
  );
}

function isInsertOperation(
  operation: DataManipulationRequest['operation'],
): operation is Extract<
  DataManipulationRequest['operation'],
  { kind: 'insert' | 'insertMany' | 'upsert' }
> {
  return (
    operation.kind === 'insert' ||
    operation.kind === 'insertMany' ||
    operation.kind === 'upsert'
  );
}
