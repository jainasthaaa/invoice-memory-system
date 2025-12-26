import { getDB } from "../db/database.js";

export async function getVendorMemory(vendor: string) {
  const db = getDB();
  return db.all(
    "SELECT * FROM vendor_memory WHERE vendor = ?",
    vendor
  );
}

export async function reinforceVendorMemory(
  vendor: string,
  key: string,
  value: string
) {
  const db = getDB();

  await db.run(
    `
    INSERT INTO vendor_memory (vendor, key, value, confidence, lastUpdated)
    VALUES (?, ?, ?, 0.6, datetime('now'))
    `,
    vendor,
    key,
    value
  );
}

