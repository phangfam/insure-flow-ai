# PRD_LBS_Insurance_Doc_Agent.md

# PRD — LBS Insurance Document Agent (v1)

**Owner:** Chris Phang / Lobang Media
**Client:** [Insurance agency — via referral], operating under Momoko's LBS client database
**Status:** Draft for client review
**Date:** 2026-09-11

---

## 1. Problem

The agency's Dropbox holds an unsorted backlog of scanned insurance forms (claims, surrenders, ILP amendments, nominee changes, proposal forms) alongside two live client databases (~3,200 records across family groups). Staff currently identify, name, and file each document by hand. Nobody can quickly answer "which documents do we have for policy X" or "is this client's surrender request filed."

**Client's own framing:** "Check Dropbox and do the necessary data arrangement."

## 2. Goal (v1 only)

Automatically classify, name, and file every new document dropped into a Dropbox inbox, and log it in a searchable index — **without touching the existing client master databases.**

Explicitly out of scope for v1 (see §8): updating the 30-column client master, family-group matching, RAG/vector search, any write-back to Momoko's sheets.

## 3. Users

- **Agency staff** (non-technical): drop scans into `/Inbox`, later search the Document Index to find a client's paperwork.
- **Momoko / data admin**: owns the client master databases; not touched by v1 but is the phase-2 stakeholder.
- **Chris (build + retainer)**: owns the n8n instance, Anthropic key, and ongoing accuracy monitoring.

## 4. Scope

### In scope — document types (Great Eastern Life, observed in samples)
- Hospitalisation & Surgical Claim — Attending Physician's Statement + Claimant's Statement
- Death Claim Form
- Investment-Linked Plan Amendment (PSF06A)
- Discharge Voucher for Withdrawal/Surrender (PSF33) — partial withdrawal / full surrender
- Nomination/Trustee Appointment
- Request for Contractual Changes with Health Declaration (PSF02)
- Letter of Consent (PSF04)
- ILP Alteration Calculator printouts
- Handwritten proposal / fact-find forms (lower confidence expected; routed to review)

### Out of scope
- Non-Great Eastern insurers (add later if the agency writes other companies)
- Policy contracts / brochures (not transactional, no fixed schema)
- Anything not a scanned form (e.g. WhatsApp chat screenshots, marketing images)

## 5. Functional requirements

| # | Requirement |
|---|---|
| F1 | Poll Dropbox `/Inbox` on a schedule (default: every 10 min) for new PDF/JPG/PNG files |
| F2 | Send each file to Claude with a fixed extraction schema (forced tool call — no free-text parsing) |
| F3 | Extract: form type, form code, insurer, policy no. (10 digits), life assured name, NRIC (12-digit New NRIC), policy owner name (if different), transaction date, agent name/code, key amount, one-line summary, handwritten flag, self-reported confidence |
| F4 | Validate extracted fields in code (digit-count checks, date format, required-field presence) — do not trust the model's formatting blindly |
| F5 | Route: if all validations pass **and** confidence ≥ 0.8 **and** not handwritten → status `OK`. Otherwise → status `REVIEW` |
| F6 | Rename file to `YYYY-MM-DD_FORMTYPE_NAME_POLICYNO[_REVIEW].ext` |
| F7 | `OK` files move to `/Clients/<NRIC>/`. `REVIEW` files stay in `/Inbox` with the `_REVIEW` suffix for a human to resolve |
| F8 | Append one row per document to a **Document Index** Google Sheet (append-only; source path, all extracted fields, status, reason, token usage) |
| F9 | Never modify the existing Momoko/LBS client master spreadsheets |

## 6. Non-functional requirements

- **PDPA compliance:** all data (Dropbox, Google Sheets, Anthropic API key) must run under the agency's own accounts, not Chris's or Anthropic's shared consumer tier. Self-hosted n8n only — no n8n Cloud, no third-party SaaS automation layer (Zapier/Make) for this data.
- **Auditability:** every automated decision (rename, move, index row) must be traceable to the source file and the model's stated confidence/reason.
- **Fail safe, not fail silent:** anything uncertain defaults to human review, never to a wrong classification landing in a client's real folder.
- **No data loss:** original filename and Dropbox path are always preserved in the index row even after rename/move.
- **Cost transparency:** token usage logged per document for cost monitoring.

## 7. Success metrics (first 2–4 weeks)

- % of documents landing in `OK` status without a human correction needed (target: track and report, no target number pre-committed — this is unproven until real volume runs through it)
- Time from drop to filed (target: within one polling cycle, i.e. ≤10 min)
- Zero incidents of a document filed under the wrong client
- Index sheet becomes the team's actual reference (qualitative: staff stop asking "where's this document" in chat)

## 8. Phased roadmap

- **Phase 1 (this spec):** Dropbox → Claude → validate → rename/file → Document Index. No master DB writes.
- **Phase 2 (after Phase 1 proves accurate):** Match indexed documents to the 30-column Momoko master via NRIC lookup; write transaction history back as a linked log, still not overwriting master fields directly.
- **Phase 3 (only if volume justifies it):** Family-group matching, dashboard/reporting layer on top of the index, possibly a lightweight portal for staff instead of raw Google Sheets.

## 9. Risks & open questions

- **Volume unknown** — pricing and infra choice (VPS size, polling frequency) depend on how many files are actually in the Dropbox backlog. *Blocking: need a folder screenshot/count from the agency before final quote.*
- **"Arranged" is undefined** — no confirmed example of what a correctly-filed client folder looks like from the agency's side. *Needs one example from Momoko before Phase 1 is called done.*
- **Handwriting accuracy** — the nominee form and proposal forms sampled are handwritten; expect a meaningful review-queue rate on these, not near-zero.
- **Cross-border data processing** — confirm Anthropic API terms / DPA suit the agency's PDPA obligations before go-live with real client data.
- **Retainer vs handoff** — this is infra touching regulated personal data; recommended as retainer, not a clean handoff (per standing project principle).

## 10. Tech stack (v1)

- Orchestration: n8n, self-hosted (VPS)
- Extraction model: Claude Sonnet 5, forced tool-call schema
- Storage/trigger: Dropbox (agency-owned)
- Index: Google Sheets (agency-owned)
- Est. cost: ~USD 0.02–0.04/document in API tokens + ~RM30–40/month VPS

---

*Reference implementation: `lbs_insurance_doc_agent.workflow.json` + `README_LBS_Doc_Agent.md` (delivered separately).*