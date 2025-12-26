import { initDB } from "../db/database.js";
import { applyMemory, learnVendorMemory } from "../memory/memoryservice.js";

// Type for invoices
interface Invoice {
  invoiceNumber: string;
  vendor: string;
  rawText: string;
  extractedFields: Record<string, any>;
  amount?: number | null;
  correctedFields?: Record<string, any>;
}

interface AuditStep {
  step: "recall" | "apply" | "decide" | "learn";
  timestamp: string;
  details: string;
}

async function processInvoiceDemo(invoice: Invoice) {
  const auditTrail: AuditStep[] = [];

  // ---- RECALL + APPLY MEMORY ----
  auditTrail.push({
    step: "recall",
    timestamp: new Date().toISOString(),
    details: "Checked vendor memory for reusable corrections"
  });

  const { invoice: updatedInvoice, proposedCorrections, updates } =
    await applyMemory(invoice);

  if (proposedCorrections.length > 0) {
    auditTrail.push({
      step: "apply",
      timestamp: new Date().toISOString(),
      details: proposedCorrections.join(", ")
    });
  }

  // ---- DECISION ----
  const requiresHumanReview = proposedCorrections.length > 0;

  auditTrail.push({
    step: "decide",
    timestamp: new Date().toISOString(),
    details: requiresHumanReview
      ? "Human review required due to unresolved corrections"
      : "Invoice auto-processed with confidence"
  });

  // ---- REASONING (NEVER EMPTY) ----
  const reasoning =
    updates.length > 0
      ? updates.join("; ")
      : "No memory updates were required. Invoice processed using existing rules.";

  return {
    normalizedInvoice: updatedInvoice,
    proposedCorrections,
    requiresHumanReview,
    reasoning,
    confidenceScore: requiresHumanReview ? 0.7 : 0.95,
    memoryUpdates: updates,
    auditTrail
  };
}

async function runDemo() {
  await initDB();

  console.log("\n===== Invoice #1 =====");

  const invoice1: Invoice = {
    invoiceNumber: "INV-A-001",
    vendor: "Supplier GmbH",
    rawText: "Leistungsdatum: 12.10.2024",
    extractedFields: {},
    amount: null,
    correctedFields: { serviceDate: "12.10.2024" } // Human corrected
  };

  const result1 = await processInvoiceDemo(invoice1);
  console.log(JSON.stringify(result1, null, 2));

  // ---- LEARN MEMORY ----
  if (invoice1.correctedFields) {
    for (const field of Object.keys(invoice1.correctedFields)) {
      await learnVendorMemory(
        invoice1.vendor,
        field,
        invoice1.correctedFields[field]
      );
    }
  }

  console.log("\n===== Invoice #2 =====");

  const invoice2: Invoice = {
    invoiceNumber: "INV-A-003",
    vendor: "Supplier GmbH",
    rawText: "Leistungsdatum: 15.10.2024",
    extractedFields: {},
    amount: null,
    correctedFields: {}
  };

  const result2 = await processInvoiceDemo(invoice2);
  console.log(JSON.stringify(result2, null, 2));
}

runDemo();
