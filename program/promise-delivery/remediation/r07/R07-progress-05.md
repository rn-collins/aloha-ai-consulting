# R07 Progress Report 05 — Regulatory Bill Analyzer Bounded Evaluation

Date: 2026-08-01

Status: passed locally within the documented regulatory-language-triage boundary; R07 remains open

Production origin: `https://aloha-ai-consulting.vercel.app`

Frozen audit baseline: 4,289 promise records / 9,552 occurrences; unchanged

## Unit boundary

This unit evaluates Regulatory Bill Analyzer only as deterministic, browser-local English-language lexical triage of user-supplied legislative or regulatory text into six configured categories: obligations, prohibitions, deadlines, thresholds, public authority, and enforcement. It lists matched terms and fixed review questions. It does not retrieve official text, extract complete clauses, establish jurisdiction or authority status, identify every relevant provision, infer actors or stakeholders, calculate dates or thresholds, assign risk, summarize an instrument, determine legal effect or applicability, or provide legal advice. No configured signal is an abstention, not clearance.

## Disposition and before state

The public page promised issue tags, stakeholder inference, quoted obligations in context, deadlines, dollar thresholds, a risk read, a plain-English summary, and a counsel checklist. Rule version 1.0.0 instead performed case-insensitive substring matching against four short lexicons and returned only category names and matched terms.

Disposition: passed-limited for the exact regulatory-language-triage scope after repair to rule version 1.1.0. Every inference about completeness, governing authority, legal meaning, applicability, enforceability, risk, or compliance remains rejected as unsupported.

## Implemented

- Replaced the four-category placeholder with six visible categories: obligations, prohibitions, deadlines, thresholds, authority, and enforcement.
- Added word-boundary matching, category-specific review questions, and explicit no-match abstention behavior.
- Kept browser-local Markdown and JSON exports while attaching the rule version, scope, outcome, limitations, and human-review boundary.
- Published a thirty-case synthetic corpus covering every category, multi-category results, neutral inputs, and an out-of-scope input.
- Added five explicit unsupported-inference rejection cases.
- Added a fail-closed threshold requiring 100% case accuracy, 100% per-class recall, zero unexpected category flags, zero false clearances, 100% abstention accuracy, and 100% unsupported-inference rejection.
- Published the versioned evaluation record at `/api/evaluations/bill-analyzer.json`.
- Corrected public copy that implied stakeholder inference, clause extraction, risk scoring, summarization, or comprehensive review.
- Recorded the tool as `limited`, not legally validated or professionally certified, in the canonical assurance and release controls.
- Added the evaluation to complete CI and the release-blocking assurance gate.

## Automated results

- 30/30 labeled evaluation cases passed.
- 4/4 required abstentions passed.
- 5/5 unsupported inferences were rejected.
- 0 unexpected category flags and 0 false clearances within the declared lexical scope.
- 4/5 high-stakes tools now have bounded evaluation decisions.
- 1/5 high-stakes tools remains explicitly unevaluated.
- 7/7 site-assurance domains remain required and uncertified.
- Frozen 4,289/9,552 audit baseline preserved.

## Remaining limitations

- The corpus is synthetic and evaluates configured lexical behavior, not real-world recall, legal interpretation, or completeness.
- The tool cannot reliably understand negation, quotation, exceptions, scope, implied duties, technical synonyms, legislative drafting conventions, or surrounding context.
- The tool does not retrieve or authenticate official text, determine version or effective status, follow definitions or cross-references, or compare amendments.
- Matches list configured terms rather than extracting complete clauses, actors, dates, quantities, remedies, or legal consequences.
- Production behavior and public artifact availability require verification after deployment.

## Production verification

PASS within the stated boundary. GitHub `main` evaluation commit `aa2102e774994ebc4fd9f0cf6fe95a6f9b2b5dcc` deployed through Vercel production deployment `dpl_FECnrCeWqZF5eVNuBZrG8KPovYUo`. Live review then found four residual capability overstatements in the summary and dossier. Corrective commit `fd92d8a32382be567c22af37a8d4dcf5f8897721`, whose remote tree `631849061d712cca98c1dc837cfa4cbea97ebb5b` exactly matched the locally tested tree, deployed through Vercel production deployment `dpl_9fVNfQ5y1K4SdHQekqHn6yqkpAFq`.

Production verification established:

- Both deployments reached `READY`, targeted production, and Vercel metadata identified the exact GitHub commits.
- `/tools/bill-analyzer`, `/api/evaluations/bill-analyzer.json`, and `/api/assurance-manifest.json` returned HTTP 200 from the canonical domain.
- The canonical tool page visibly says `bounded evaluation` and rule `1.1.0` and contains no stale `not evaluated` label.
- The live evaluation reports 30 cases, 30 passes, zero failures, four correct abstentions, zero unexpected category flags, zero false clearances, five unsupported-inference cases, and the `passed-limited-regulatory-language-triage-scope` decision.
- The live assurance manifest reports four evaluated high-stakes tools, Regulatory Bill Analyzer as `passed-limited`, Controlled Substances Explainer as `not-evaluated`, seven uncertified assurance domains, and zero assurance errors.
- The live summary accurately describes lexical triage, and the page no longer claims stakeholder inference, surrounding-clause quotation, obligation-density risk scoring, or an assembled plain-English summary.
- No clause-completeness, jurisdiction, authority-status, applicability, legal-effect, risk, compliance, or legal-advice conclusion is claimed.

R07 Unit 5 is closed. R07 remains open for Controlled Substances Explainer and seven evidence-producing site-assurance domains.

Verifier: Codex remediation agent

Retest trigger: any lexicon, matching logic, category, review question, output field, jurisdiction boundary, prohibited-inference boundary, public capability claim, renderer status logic, method, or assurance-schema change; otherwise 2026-11-01.
