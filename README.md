# Invoice Memory System
## Overview

I built an Invoice Memory System that learns from past invoice corrections and applies those learnings to future invoices.
Instead of repeating the same manual fixes, the system stores correction patterns as memory and uses them to make smarter decisions over time.

The focus of this project is learning, decision logic, and explainability, not OCR or extraction.

## Design

The system is designed as a memory layer on top of invoice extraction.

## Flow:

Invoice Input → Recall Memory → Apply Memory → Decide → Learn → Store Audit


I separated the logic into small services so that each step is clear and explainable.

Memory Types I Implemented

1. Vendor Memory

Stores vendor-specific patterns like:

Field mappings (e.g. “Leistungsdatum” → serviceDate)

VAT behavior (Prices include VAT)

Common SKUs or descriptions

Currency recovery rules

This helps future invoices from the same vendor get processed faster.

2. Correction Memory

Learns from repeated corrections such as:

Quantity mismatch fixes

PO matching strategies

Tax recalculation rules

If the same correction happens multiple times, confidence increases.

3. Resolution Memory

Tracks how issues were resolved:

Human approved

Human rejected

Auto-accepted

This helps prevent wrong learnings and reduces bad auto-corrections.

## Decision Logic (How It Works)

For every invoice, I follow these steps:

1. Recall

Fetch relevant vendor and correction memory from the database.

2. Apply

Use high-confidence memory to:

Normalize fields

Suggest corrections

Detect known patterns

Low-confidence memory is not auto-applied.

3. Decide

Based on confidence:

Auto-accept

Suggest correction

Escalate for human review

4. Learn

After human feedback:

Update memory

Increase or decrease confidence

Store audit logs

Confidence Handling

Each memory has a confidence score (0–1)

Confidence increases when humans approve corrections

Confidence decreases when corrections are rejected

This prevents wrong patterns from dominating

## Audit & Explainability

Every invoice includes:

Clear reasoning text

Confidence score

Step-by-step audit trail (recall, apply, decide, learn)

This makes the system transparent and easy to debug.

Demo (Learning Over Time)

Run Invoice #1 → system flags issues

Apply human correction → memory is stored

Run Invoice #2 (same vendor)

System makes better decisions with fewer flags

This clearly shows learning over time.

## Tech Stack Used

Node.js

TypeScript (strict mode)

Fastify

SQLite (persistent memory)

## Conclusion

This project shows how a memory-driven, heuristic-based system can improve invoice automation without machine learning.
By learning from human feedback and tracking confidence, the system becomes smarter, safer, and more reliable over time.
