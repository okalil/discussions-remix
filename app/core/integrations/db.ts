import { DatabaseSync } from 'node:sqlite';
import { createDatabase, type Database } from 'remix/data-table';
import { createSqliteDatabaseAdapter } from 'remix/data-table-sqlite';

import { setup } from './db/setup.ts';

export type DatabaseClient = Database;

const sqlite = new DatabaseSync('./data.db');
await setup(sqlite);

export const db = createDatabase(createSqliteDatabaseAdapter(sqlite));
