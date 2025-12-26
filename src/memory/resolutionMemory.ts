import { getDB } from "../db/database.js";

export async function updateResolution(pattern: string, approved: boolean) {
  const db = getDB();

  const row = await db.get(
    "SELECT * FROM resolution_memory WHERE pattern = ?",
    pattern
  );

  if (!row) {
    await db.run(
      `
      INSERT INTO resolution_memory VALUES (?, ?, ?)
      `,
      pattern,
      approved ? 1 : 0,
      approved ? 0 : 1
    );
  }
}
