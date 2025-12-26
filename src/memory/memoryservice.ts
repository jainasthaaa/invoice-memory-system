import { getDB } from "../db/database.js";

export async function recallVendorMemory(vendor: string, field: string) {
  const db = getDB();
  return db.get(
    `SELECT * FROM vendor_memory WHERE vendor = ? AND field = ?`,
    [vendor, field]
  );
}

export async function applyMemory(invoice: any) {
  const db = getDB();
  const updates: string[] = [];
  const proposedCorrections: string[] = [];

  // Example: apply vendor memory for each field
  for (const key of Object.keys(invoice)) {
    const memory = await recallVendorMemory(invoice.vendor, key);
    if (memory && memory.confidence > 0.7) {
      invoice[key] = memory.correctedValue;
      proposedCorrections.push(`${key} auto-corrected`);
      updates.push(`Used vendor memory for ${key}`);
      // Update confidence
      await db.run(
        `UPDATE vendor_memory SET timesUsed = timesUsed + 1, lastUsed = ? WHERE id = ?`,
        [new Date().toISOString(), memory.id]
      );
    }
  }

  return { invoice, proposedCorrections, updates };
}

export async function learnVendorMemory(vendor: string, field: string, correctedValue: string) {
  const db = getDB();
  const existing = await db.get(
    `SELECT * FROM vendor_memory WHERE vendor = ? AND field = ?`,
    [vendor, field]
  );

  if (existing) {
    // reinforce
    await db.run(
      `UPDATE vendor_memory SET correctedValue = ?, confidence = confidence + 0.1, timesUsed = timesUsed + 1, lastUsed = ? WHERE id = ?`,
      [correctedValue, new Date().toISOString(), existing.id]
    );
  } else {
    // insert new
    await db.run(
      `INSERT INTO vendor_memory (vendor, field, correctedValue) VALUES (?, ?, ?)`,
      [vendor, field, correctedValue]
    );
  }
}
