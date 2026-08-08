# Decision Desk 01 — completed Evaluation Card example

Version 1.0 · fictional teaching example · no legal or deployment authorization

## Decision record

- Firm: Kaimana & Vale LLP (fictional)
- Decision owner: managing partner
- Evaluation lead: operations lead
- Date opened/reviewed: August 29, 2026 / August 30, 2026
- Controlling jurisdictions: unresolved; participant and matter facts not yet bounded
- Proposed outcome: continue human-led

## Gate findings

### Gate 1 — work before technology: FAIL

Evidence: four intake channels; no common authoritative record; inconsistent conflict/alias capture; unstructured urgency; no measured baseline; no error/rework log; no named workflow or stop owner; untested incident path.

Required redesign: establish a source-of-truth record, structured party/alias and urgency fields, source-review rule, escalation path, baseline measures, correction log, and named owners.

### Gate 2 — exact system: UNRESOLVED

Evidence: candidate brand names exist, but exact feature, tier, model/version, tenant, configuration, integrations, roles, prompts/schema, contract, and change-control record do not.

Disposition: no product nomination and no synthetic run.

### Gate 3 — authority and data: UNRESOLVED

Evidence: controlling jurisdictions and local authority review are incomplete; data flow, subprocessors, retention, deletion, training use, provider access, storage, incident notice, export, audit, contract, accessibility, and language evidence are incomplete.

Disposition: no live data and no live pilot.

### Gate 4 — representative test set: UNRESOLVED

Evidence: the governed 24-case fictional benchmark is a valid starting asset, but Kaimana & Vale has not documented its intended matter classes, population, failure history, exclusions, or reviewer-approved routing policy. The firm has not established that the set represents its use.

Disposition: do not run evaluation until the firm approves/expands the manifest and freezes thresholds.

### Gate 5 — human factors: NOT RUN

No product or workflow has been tested. No claim about reviewer error detection, reliance, accessibility burden, workload, or operational value is permitted.

## Worked scoring: I01-002

| Error | Finding | Severity/consequence |
|---|---|---|
| Unsupported addition | “Client”; “was struck”; company contact treated as driver; police “documented the accident”; photographs described as supporting | Critical/high; changes relationship, causation, roles, evidence |
| Omission | Letter is missing; role of company contact uncertain; report absent; representation not decided | High; blocks verification/conflicts/routing |
| Distortion | “Early-September legal deadline” replaces the exact stated September 3 response date and its source | Critical; loses exact date and creates legal certainty |
| Entity/role error | Unidentified company contact becomes driver | High; conflict and merits contamination |
| Urgency miss | Synopsis softens a near response date and does not require immediate letter request | Critical; routing delay |
| False certainty | Deadline, causation, police documentation, evidence value, and client status asserted | Critical/high |

Acceptable corrected synopsis:

> Noel Park, a prospective inquirer, reports falling and injuring their wrist when a delivery van exited a grocery-store driveway. Noel does not state that the van struck them. They report photographs that are not uploaded, police attendance with no report supplied, and messages with a delivery-company contact whose role is unknown. Noel says a missing letter states they must respond by September 3; the date and legal effect are unverified. Escalate for urgent attorney review and request the letter, location, police information, photographs, and all party/entity names for conflict screening. Representation has not been accepted.

## Whole-process baseline

Unresolved. First-pass speed alone cannot support value. Before testing, measure total cycle time, rework, repeat contacts, routing errors, missed urgency, workload, accessibility/language performance, incidents, and total cost.

## Final disposition

**Continue human-led intake. Redesign and document the source workflow. Do not nominate a product, run synthetic testing, or use live data.**

Next actions:

1. Operations lead documents current/future workflow, source record, structured fields, baseline, and incident path.
2. Qualified legal/privacy/security reviewers resolve the bounded authority and data packet for the intended office and matter scope.
3. Decision owner selects an exact freezeable candidate only if evidence satisfies the dossier; the evaluation lead then obtains reviewer approval of the representative test set and predetermined stop rules.

Reopening trigger: Gates 1–4 have documented pass dispositions, or a material change requires rejection/redesign. Stop authority must be assigned before any evaluation.

```text
card_version: 1.0-teaching
product_dossier_version: current Issue 01 dossier
vendor_privacy_review_version: current Issue 01 review
protocol_version: current preregistered protocol
test_set_version: 1.0
gate_1: fail
gate_2: unresolved
gate_3: unresolved
gate_4: unresolved
gate_5: not_run
decision: human_led_only
decision_owner: managing partner (fictional)
qualified_reviewers: unresolved
decision_date: 2026-08-30
expiration_or_change_trigger: completion of Gates 1–4 or material workflow/product/authority change
```

