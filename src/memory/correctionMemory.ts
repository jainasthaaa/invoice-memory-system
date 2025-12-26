import { getDB } from "../db/database.js";

export async function getCorrectionMemory() {
  return getDB().all("SELECT * FROM correction_memory");
}

export async function reinforceCorrection(pattern: string, action: string) {
  await getDB().run(
    `
    INSERT INTO correction_memory (pattern, action, confidence)
    VALUES (?, ?, 0.7)
    `,
    pattern,
    action
  );
}
