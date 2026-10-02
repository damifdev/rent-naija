import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { seedDatabase } from "./seed";

// Node's built-in SQLite (Node 22.13+). Loaded through createRequire so the bundler
// leaves it alone. There is nothing to compile, so `npm install` works on Windows, macOS and Linux.
const nodeRequire = createRequire(import.meta.url);
const { DatabaseSync } = nodeRequire("node:sqlite") as typeof import("node:sqlite");

type Param = string | number | null | Record<string, string | number | null>;

/** Small wrapper so the rest of the app uses a simple prepare/get/all/run API. */
export class Db {
  constructor(private raw: import("node:sqlite").DatabaseSync) {}

  exec(sql: string) {
    this.raw.exec(sql);
  }

  prepare(sql: string) {
    const stmt = this.raw.prepare(sql);
    // Queries share parameter objects, so extra keys must not throw.
    stmt.setAllowUnknownNamedParameters(true);
    const plain = <T,>(row: T): T => (row ? ({ ...row } as T) : row);
    return {
      get: (...args: Param[]): unknown => plain(stmt.get(...(args as never[]))),
      all: (...args: Param[]): unknown[] => stmt.all(...(args as never[])).map((r) => plain(r)),
      run: (...args: Param[]) => {
        const r = stmt.run(...(args as never[]));
        return { changes: Number(r.changes), lastInsertRowid: Number(r.lastInsertRowid) };
      },
    };
  }

  /** Returns a function that runs `fn` inside a transaction (commit on success, rollback on error). */
  transaction<T>(fn: () => T): () => T {
    return () => {
      this.raw.exec("BEGIN");
      try {
        const result = fn();
        this.raw.exec("COMMIT");
        return result;
      } catch (err) {
        this.raw.exec("ROLLBACK");
        throw err;
      }
    };
  }
}

const DATA_DIR = path.join(process.cwd(), "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('tenant','landlord','admin')),
  agency TEXT,
  avatar_url TEXT,
  verified INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS properties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  state TEXT NOT NULL,
  area TEXT NOT NULL,
  price_yearly INTEGER NOT NULL CHECK (price_yearly > 0),
  bedrooms INTEGER NOT NULL DEFAULT 1,
  bathrooms INTEGER NOT NULL DEFAULT 1,
  area_sqm INTEGER,
  tag TEXT,
  amenities TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  rented INTEGER NOT NULL DEFAULT 0,
  featured INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_properties_state ON properties(state);
CREATE INDEX IF NOT EXISTS idx_properties_area ON properties(area);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price_yearly);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status, rented);
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id);

CREATE TABLE IF NOT EXISTS property_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_images_property ON property_images(property_id, position);

CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_inquiries_property ON inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_sender ON inquiries(sender_id);

CREATE TABLE IF NOT EXISTS favorites (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, property_id)
);
`;

const g = globalThis as unknown as { __rentnaijaDb?: Db };

function open() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const db = new Db(new DatabaseSync(path.join(DATA_DIR, "rentnaija.db")));
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);
  const { n } = db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number };
  if (n === 0) seedDatabase(db);
  return db;
}

export function getDb() {
  if (!g.__rentnaijaDb) g.__rentnaijaDb = open();
  return g.__rentnaijaDb;
}
