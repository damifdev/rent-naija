import "server-only";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { seedDatabase } from "./seed";

const DATA_DIR = path.join(process.cwd(), "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

export type Row = Record<string, string | number | null>;
type Scalar = string | number | null | undefined;
/** Either `?`-positional args, spread as separate call arguments, or one `@name`/`:name` object. */
type Args = [] | Scalar[] | [Record<string, Scalar>];

/** The async prepare/get/all/run shape the rest of the app codes against,
 *  whichever engine is actually running underneath. Supports both calling styles
 *  already used across the app: `stmt.run(a, b, c)` for `?`-positional SQL, and
 *  `stmt.run({ name: value })` for `@name` SQL. */
export interface PreparedLike {
  get(...args: Args): Promise<Row | undefined>;
  all(...args: Args): Promise<Row[]>;
  run(...args: Args): Promise<{ changes: number; lastInsertRowid: number }>;
}
export interface Db {
  /** Runs one or more semicolon-separated statements with no parameters (schema setup). */
  exec(sql: string): Promise<void>;
  prepare(sql: string): PreparedLike;
}

/**
 * Two engines, same SQL dialect (libSQL is a SQLite superset):
 *
 * - Local file, via Node's own built-in `node:sqlite` (Node 22.13+). Nothing to install or
 *   compile, so `npm install` and `npm run dev` work out of the box on Windows, macOS and Linux.
 *   This is the default, and what runs on a host with a normal writable disk (e.g. Render).
 * - Turso (hosted libSQL), via `@libsql/client/web` — a pure-JS/HTTP client with no native
 *   addon, used only when TURSO_DATABASE_URL is set. This is what makes the app work on Vercel,
 *   whose serverless functions have no writable, persistent disk for a local SQLite file.
 *
 * Switch by setting TURSO_DATABASE_URL (and TURSO_AUTH_TOKEN) in the environment — no code
 * changes needed either way.
 */
async function openDb(): Promise<Db> {
  const url = process.env.TURSO_DATABASE_URL;
  if (url) {
    const { createClient } = await import("@libsql/client/web");
    const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
    // libsql's `args` accepts a positional array or a named object directly; it just doesn't
    // allow `undefined` members, so those become `null`.
    const clean = (v: Scalar) => v ?? null;
    const toArgs = (args: Args) =>
      args.length === 1 && typeof args[0] === "object" && args[0] !== null
        ? Object.fromEntries(Object.entries(args[0]).map(([k, v]) => [k, clean(v)]))
        : (args as Scalar[]).map(clean);
    const toRow = (r: Record<string, unknown>): Row => ({ ...r }) as Row;
    return {
      async exec(sql) {
        await client.executeMultiple(sql);
      },
      prepare(sql) {
        return {
          async get(...args) {
            const rs = await client.execute({ sql, args: toArgs(args) });
            return rs.rows[0] ? toRow(rs.rows[0]) : undefined;
          },
          async all(...args) {
            const rs = await client.execute({ sql, args: toArgs(args) });
            return rs.rows.map(toRow);
          },
          async run(...args) {
            const rs = await client.execute({ sql, args: toArgs(args) });
            return { changes: Number(rs.rowsAffected), lastInsertRowid: Number(rs.lastInsertRowid ?? 0) };
          },
        };
      },
    };
  }

  // Loaded via createRequire so the bundler leaves it alone, and only reached when
  // TURSO_DATABASE_URL is unset — so this path, and its platform binary, are never touched
  // in a Turso/Vercel deployment.
  const nodeRequire = createRequire(import.meta.url);
  const { DatabaseSync } = nodeRequire("node:sqlite") as typeof import("node:sqlite");
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const raw = new DatabaseSync(path.join(DATA_DIR, "rentnaija.db"));
  raw.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  const plain = <T,>(row: T): T => (row ? ({ ...row } as T) : row);
  return {
    async exec(sql) {
      raw.exec(sql);
    },
    prepare(sql) {
      const stmt = raw.prepare(sql);
      stmt.setAllowUnknownNamedParameters(true); // named-params objects are shared across queries
      return {
        async get(...args) {
          return plain(stmt.get(...(args as never[]))) as Row | undefined;
        },
        async all(...args) {
          return (stmt.all(...(args as never[])) as Row[]).map(plain);
        },
        async run(...args) {
          const r = stmt.run(...(args as never[]));
          return { changes: Number(r.changes), lastInsertRowid: Number(r.lastInsertRowid) };
        },
      };
    },
  };
}

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

const g = globalThis as unknown as { __rentnaijaDb?: Promise<Db> };

function init(): Promise<Db> {
  return (async () => {
    const db = await openDb();
    await db.exec(SCHEMA);
    const { n } = (await db.prepare("SELECT COUNT(*) AS n FROM users").get()) as { n: number };
    if (n === 0) await seedDatabase(db);
    return db;
  })();
}

export function getDb(): Promise<Db> {
  if (!g.__rentnaijaDb) g.__rentnaijaDb = init();
  return g.__rentnaijaDb;
}
