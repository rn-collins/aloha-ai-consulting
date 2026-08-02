# R07 Progress Report 04 — Evidence Explainer Bounded Evaluation

Date: 2026-08-01

Status: passed locally within the documented claim-language-triage boundary; R07 remains open

Production origin: `https://aloha-ai-consulting.vercel.app`

Frozen audit baseline: 4,289 promise records / 9,552 occurrences; unchanged

## Unit boundary

This unit evaluates Evidence Explainer only as deterministic, browser-local lexical triage of one English-language health claim into five visible categories. Each matched category returns a prewritten evidence question, evidence-design prompt, and confounders to inspect. It does not read sources, conduct a literature review, grade a study or evidence base, determine truth, prescribe a universally sufficient study design, or provide medical advice. No configured signal is an abstention, not clearance.

## Disposition and before state

The public page promised five claim types, evidence-tier mapping, confounders, and evidence-strength assessment. Rule version 1.0.0 instead matched only four broad lexicons and returned category names without evidence questions, evidence-design prompts, confounders, a truth boundary, or explicit abstention behavior.

Disposition: passed-limited for the exact claim-language-triage scope after repair to rule version 1.1.0. Every inference about truth, scientific validity, evidence quality, study sufficiency, or individual health remains rejected as unsupported.

## Implemented

- Replaced the four-category placeholder with five visible categories: causal, mechanism, association, anecdotal, and absolute or overstated language.
- Added word-boundary matching, category-specific evidence questions, evidence-design prompts, and confounders.
- Added a visible and exportable no-match abstention.
- Published a thirty-case synthetic corpus covering each category, multi-category results, neutral inputs, and an out-of-scope input.
- Added five explicit unsupported-inference rejection cases.
- Added a fail-closed threshold requiring 100% case accuracy, 100% per-class recall, zero unexpected category flags, zero false clearances, 100% abstention accuracy, and 100% unsupported-inference rejection.
- Published the versioned evaluation record at `/api/evaluations/evidence-explainer.json`.
- Corrected public copy that implied the tool grades evidence or selects a universally sufficient evidence tier.
- Recorded the tool as `limited`, not scientifically or medically validated, in the canonical release registry.
- Added the evaluation to complete CI and the release-blocking assurance gate.

## Automated results

- 30/30 labeled evaluation cases passed.
- 4/4 required abstentions passed.
- 5/5 unsupported inferences were rejected.
- 0 unexpected category flags and 0 false clearances within the declared lexical scope.
- 105/105 repository tests passed.
- 3/5 high-stakes tools now have bounded evaluation decisions.
- 2/5 high-stakes tools remain explicitly unevaluated.
- 7/7 site-assurance domains remain required and uncertified.
- 257 canonical resources and 497 HTML files validated.
- 498 public route surfaces and 9,626 interactive occurrences audited.
- 94/94 represented shared actions remained governed.
- 5,215 current promise records / 11,787 occurrences exactly matched the reviewed release registry.
- Frozen 4,289/9,552 audit baseline preserved.

## Remaining limitations

- The corpus is synthetic and evaluates configured lexical behavior, not real-world recall or scientific validity.
- The tool cannot reliably understand negation, quotation, sarcasm, implied claims, technical synonyms, or surrounding context.
- Evidence-design prompts are starting questions, not universal prescriptions; ethics, feasibility, population, outcomes, and domain standards require expert review.
- The tool does not retrieve or appraise research and cannot establish whether a claim is true, false, adequately supported, or medically appropriate.
- Production behavior and public artifact availability require verification after deployment.

R07 Unit 4 is locally complete. R07 remains open for Regulatory Bill Analyzer, Controlled Substances Explainer, and seven evidence-producing site-assurance domains.

Verifier: Codex remediation agent

Retest trigger: any lexicon, matching logic, category, evidence-design prompt, confounder, output field, prohibited-inference boundary, public capability claim, renderer status logic, method, or assurance-schema change; otherwise 2026-11-01.
