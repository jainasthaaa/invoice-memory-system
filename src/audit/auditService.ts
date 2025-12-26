import { getDB } from "../db/database.js";

export async function logAudit(invoiceId: string, vendor: string, action: string, details?: string) {
  const db = getDB();
  await db.run(
    `INSERT INTO audit_trail (invoiceId, vendor, action, details) VALUES (?, ?, ?, ?)`,
    [invoiceId, vendor, action, details || ""]
  );
}
