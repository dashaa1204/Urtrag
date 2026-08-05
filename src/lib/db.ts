import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");

function createDb(): Database.Database {
  fs.mkdirSync(dataDir, { recursive: true });
  const db = new Database(path.join(dataDir, "crowdshipping.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name          TEXT NOT NULL,
      phone         TEXT,
      created_at    TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token      TEXT PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

    CREATE TABLE IF NOT EXISTS trips (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL REFERENCES users(id),
      direction    TEXT NOT NULL CHECK (direction IN ('at-mn', 'mn-at')),
      from_city    TEXT,
      to_city      TEXT,
      travel_date  TEXT NOT NULL,
      available_kg REAL NOT NULL,
      price_per_kg REAL NOT NULL,
      notes        TEXT,
      status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
      created_at   TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_trips_status_date ON trips(status, travel_date);

    CREATE TABLE IF NOT EXISTS shipments (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER NOT NULL REFERENCES users(id),
      direction     TEXT NOT NULL CHECK (direction IN ('at-mn', 'mn-at')),
      from_city     TEXT,
      to_city       TEXT,
      weight_kg     REAL NOT NULL,
      ready_date    TEXT,
      deadline_date TEXT,
      description   TEXT NOT NULL,
      offer_price   REAL,
      status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
      created_at    TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status, created_at);

    CREATE TABLE IF NOT EXISTS conversations (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_type TEXT NOT NULL CHECK (listing_type IN ('trip', 'shipment')),
      listing_id   INTEGER NOT NULL,
      starter_id   INTEGER NOT NULL REFERENCES users(id),
      owner_id     INTEGER NOT NULL REFERENCES users(id),
      created_at   TEXT NOT NULL,
      UNIQUE (listing_type, listing_id, starter_id)
    );
    CREATE INDEX IF NOT EXISTS idx_conversations_starter ON conversations(starter_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_owner ON conversations(owner_id);

    CREATE TABLE IF NOT EXISTS reviews (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      reviewer_id     INTEGER NOT NULL REFERENCES users(id),
      reviewee_id     INTEGER NOT NULL REFERENCES users(id),
      rating          INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment         TEXT,
      created_at      TEXT NOT NULL,
      UNIQUE (conversation_id, reviewer_id)
    );
    CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id);

    CREATE TABLE IF NOT EXISTS messages (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id       INTEGER NOT NULL REFERENCES users(id),
      body            TEXT NOT NULL,
      created_at      TEXT NOT NULL,
      read_at         TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
  `);
  return db;
}

// next dev-ийн hot reload бүрт шинэ холболт нээхээс сэргийлнэ
const globalForDb = globalThis as unknown as { __crowdshippingDb?: Database.Database };

export const db = (globalForDb.__crowdshippingDb ??= createDb());
