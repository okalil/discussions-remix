import type { SqlStatement } from 'remix/data-table';

import type { Database } from '../db.ts';

export async function query<T>(
  db: Database,
  statement: SqlStatement,
): Promise<T[]> {
  const result = await db.exec(statement);
  return (result.rows ?? []) as T[];
}

export async function queryOne<T>(
  db: Database,
  statement: SqlStatement,
): Promise<T | undefined> {
  const rows = await query<T>(db, statement);
  return rows.at(0);
}

export function count(value: unknown) {
  return Number(value ?? 0);
}
