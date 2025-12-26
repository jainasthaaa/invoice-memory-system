import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB folder + file
const DB_DIR = path.join(__dirname, "../../data");
const DB_PATH = path.join(DB_DIR, "memory.db");

let db: Database<sqlite3.Database, sqlite3.Statement>;

export async function initDB() {
  // Ensure folder exists
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });

  // Create tables with proper defaults
  await db.exec(`
    CREATE TABLE IF NOT EXISTS vendor_memory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vendor TEXT NOT NULL,
      field TEXT NOT NULL,
      correctedValue TEXT NOT NULL,
      confidence REAL DEFAULT 1.0,
      timesUsed INTEGER DEFAULT 0,
      lastUsed TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS invoice_memory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoiceId TEXT,
      vendor TEXT,
      issueType TEXT,
      originalValue TEXT,
      correctedValue TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_trail (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoiceId TEXT,
      vendor TEXT,
      action TEXT,
      details TEXT DEFAULT '',
      timestamp TEXT DEFAULT (datetime('now'))
    );
  `);

  return db;
}

export function getDB() {
  if (!db) throw new Error("Database not initialized");
  return db;
}
