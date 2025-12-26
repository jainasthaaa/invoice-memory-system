export interface Invoice {
  invoiceNumber: string;
  vendor: string;
  rawText: string;
  extractedFields: Record<string, any>;
}
