import { Invoice } from "./models/invoise.js";
import { getVendorMemory } from "./memory/vendormemory.js";
import { decide } from "./engine/decide.js";
import { getDB } from "./db/database.js";

export async function processInvoice(invoice: Invoice) {
  const auditTrail: any[] = [];

  // RECALL
  const vendorMemory = await getVendorMemory(invoice.vendor);
  auditTrail.push({
    step: "recall",
    timestamp: new Date().toISOString(),
    details: vendorMemory
  });

  // APPLY
  const proposedCorrections = vendorMemory.map(
    (m: any) => `Mapped ${m.key} → ${m.value}`
  );

  const confidenceScore = vendorMemory.length ? 0.8 : 0.3;
  auditTrail.push({
    step: "apply",
    timestamp: new Date().toISOString(),
    details: proposedCorrections
  });

  // DECIDE
  const requiresHumanReview = decide(confidenceScore);
  auditTrail.push({
    step: "decide",
    timestamp: new Date().toISOString(),
    details: requiresHumanReview
      ? "Escalated for review"
      : "Auto-accepted"
  });

  // AUDIT STORE
  const db = getDB();
  for (const entry of auditTrail) {
    await db.run(
      "INSERT INTO audit_trail VALUES (?, ?, ?)",
      entry.step,
      entry.timestamp,
      JSON.stringify(entry.details)
    );
  }

  return {
    normalizedInvoice: invoice.extractedFields,
    proposedCorrections,
    requiresHumanReview,
    reasoning:
      "Vendor-specific memory applied with confidence scoring and audit logging.",
    confidenceScore,
    memoryUpdates: [],
    auditTrail
  };
}
