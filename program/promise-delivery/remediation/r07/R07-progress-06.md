# R07 Progress Report 06 — Controlled Substances Explainer Bounded Evaluation

Date: 2026-08-02

Status: passed locally within the documented federal-authority-routing boundary; R07 remains open

Frozen audit baseline: 4,289 promise records / 9,552 occurrences; unchanged

## Unit boundary

This unit evaluates the Controlled Substances Explainer only as deterministic, browser-local routing of English-language mentions of four configured substances—psilocybin, MDMA, cannabis, and ketamine—to dated U.S. federal schedule reference records, current eCFR routes, Federal Register routes, and verification instructions. It does not determine legality, permission, approval, registration, prescribing, research authorization, applicability, or any state, tribal, territorial, local, or international status. A no-match result is an abstention, never a finding that a substance is uncontrolled.

## Disposition and before state

The public page promised substance and lens selection, schedule and agency explanations, assembled stable facts, and federal-state structure. Rule version 1.0.0 instead returned the same generic five-step checklist for every input and did not identify a substance, schedule, source, agency route, or abstention.

Disposition: passed-limited for the exact federal-authority-routing scope after repair to rule version 1.1.0. Every inference about legal status, an activity, authorization, registration, approval, or nonfederal law remains rejected as unsupported.

## Implemented

- Added four explicit, dated federal reference records with configured aliases, schedule labels, eCFR routes, Federal Register routes, and verification instructions.
- Added deterministic normalized-word matching and explicit abstention outside the configured aliases.
- Added visible federal-only, dated-record, and no-legal-status boundaries to the tool and its exported JSON record.
- Published a 24-case corpus covering all four substances, multi-record routes, neutral and unconfigured inputs, nonfederal questions, and non-English input.
- Added five unsupported-inference rejection cases.
- Added a fail-closed threshold requiring 100% case accuracy, 100% per-class recall, zero unexpected routes, zero false clearances, 100% abstention accuracy, and 100% unsupported-inference rejection.
- Published the versioned evaluation record at `/api/evaluations/controlled-substances-explainer.json`.
- Recorded the tool as `limited`, not legally validated or professionally certified, in canonical assurance and release controls.
- Added the evaluation to complete CI and the release-blocking assurance gate.

## Automated results

- 24/24 labeled evaluation cases passed.
- 6/6 required abstentions passed.
- 5/5 unsupported inferences were rejected.
- 0 unexpected routes and 0 false clearances within the declared routing scope.
- 5/5 high-stakes tools now have bounded evaluation decisions.
- 7/7 site-assurance domains remain required and uncertified.
- 105/105 repository tests passed.
- 497 sitemap HTML pages plus recovery, 9,626 interactions, shared actions, and presentation QA passed.
- Current promise release registry reconciled at 5,254 records / 11,832 occurrences.
- Frozen 4,289/9,552 audit baseline preserved.

## Remaining limitations

- The corpus evaluates configured alias routing, not comprehensive controlled-substance coverage or legal interpretation.
- Dated federal schedule reference records can become stale after rulemaking or legislation.
- The tool does not interpret exemptions, analogues, isomers, mixtures, approved products, registrations, protocols, or a user's proposed activity.
- State and all other nonfederal law remain outside scope.
- Qualified human review of current primary authority is required before consequential use.

## Production verification

Pending deployment of this bounded unit.

R07 Unit 6 completes the five high-stakes tool evaluations. R07 remains open for seven evidence-producing site-assurance domains: privacy, security, accessibility, corrections, legal authority, rights and attribution, and institutional credentials.

Verifier: Codex remediation agent

Retest trigger: any substance record, alias, schedule field, source link, matching logic, output field, jurisdiction boundary, prohibited-inference boundary, public capability claim, renderer status logic, method, or assurance-schema change; otherwise 2026-11-02.
