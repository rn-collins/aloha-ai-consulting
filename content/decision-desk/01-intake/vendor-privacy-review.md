# Vendor, privacy, security, and data-lifecycle review

Status: governed review instrument; unresolved fields fail closed; not legal or security advice.

## Evidence standard

For each field, record the exact product and tier, document title, issuer, effective date, URL or file, pinpoint, reviewer, review date, contractual status, and conflicts among marketing copy, public terms, security documentation, and the negotiated agreement. “Vendor says” is not an evidence grade.

Use `verified`, `verified with condition`, `unresolved`, or `unacceptable`. Any `unresolved` or `unacceptable` high-impact field bars live prospective-client data.

| Domain | Required question | Acceptable evidence | Default |
|---|---|---|---|
| Collection | What content, metadata, identifiers, attachments, feedback, and telemetry leave the firm? | Data-flow trace plus contract and product documentation | Unresolved |
| Purpose | For which enumerated purposes may each data class be processed? | Binding purpose limitation | Unresolved |
| Training | Are inputs, outputs, feedback, or logs used for model improvement, and is opt-out tenant-wide and durable? | Contract plus verified admin setting | Unresolved |
| Human access | Who can access content, under what trigger and logging? | Access-control documentation and contract | Unresolved |
| Retention | What remains in history, abuse logs, backups, support systems, and derived records, for how long? | System-specific schedule; “zero retention” boundaries explained | Unresolved |
| Deletion | Can content, logs, derived data, and backups be deleted; on what clock and with what evidence? | Tested deletion plus contractual commitment | Unresolved |
| Subprocessors | Which entities receive which data, where, and under what change notice? | Current list and binding notice/right | Unresolved |
| Geography | Where are primary, replicated, support, and backup data processed? | Architecture statement and contract | Unresolved |
| Security | What encryption, isolation, authentication, authorization, logging, vulnerability, and development controls apply? | Current independent report plus configuration evidence | Unresolved |
| Incident response | What triggers notice, on what clock, with what cooperation? | Binding clause and response procedure | Unresolved |
| Privilege/confidentiality | Do terms preserve ownership, confidentiality, compelled-disclosure notice, and restricted use? | Executed agreement reviewed by qualified counsel | Unresolved |
| Export/audit | Can the firm reconstruct inputs, outputs, reviewer actions, changes, and deletion? | Tested export and audit trail | Unresolved |
| Accessibility | Is the actual reviewer and intake experience tested with applicable assistive technology? | Configuration-specific testing | Unresolved |
| Language | What languages are supported, with what limitations and evaluation evidence? | Product evidence plus local test results | Unresolved |
| Data rights | What access, correction, deletion, opt-out, and complaint paths apply? | Jurisdiction mapping and operating procedure | Unresolved |
| Exit | Can data and records be exported and deleted when use ends? | Tested exit plan and contract | Unresolved |

## Data-minimization boundary

Before conflicts clearance and a human decision to continue intake, request only information necessary to identify parties, run conflicts, identify urgent timing or safety signals, determine jurisdictional routing, and provide an accessible response path. The final field set requires local-authority approval; this record establishes no universal minimum.

## Current decision

No vendor, account tier, contract, configuration, or data flow has been nominated. Every vendor-specific field is unresolved. Live data, live integrations, and a live pilot are prohibited.
