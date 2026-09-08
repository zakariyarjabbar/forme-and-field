import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import * as schema from './schema';
const dbPath = resolve(
  /* turbopackIgnore: true */ process.env.DATABASE_PATH || './data/forme-field.sqlite',
);
mkdirSync(dirname(dbPath), { recursive: true });
const globalDb = globalThis as unknown as { ffSqlite?: Database.Database };
export const sqlite = globalDb.ffSqlite ?? new Database(dbPath);
globalDb.ffSqlite = sqlite;
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
sqlite.pragma('busy_timeout = 5000');
sqlite.exec(readFileSync(resolve('lib/db/migration.sql'), 'utf8'));
if (!sqlite.prepare('SELECT version FROM migrations WHERE version=2').get()) {
  sqlite.pragma('foreign_keys = OFF');
  try {
    sqlite
      .transaction(() => {
        if (!sqlite.prepare('SELECT version FROM migrations WHERE version=2').get()) {
          sqlite.exec(readFileSync(resolve('lib/db/migration-002.sql'), 'utf8'));
        }
      })
      .immediate();
  } finally {
    sqlite.pragma('foreign_keys = ON');
  }
}

export const db = drizzle(sqlite, { schema });
