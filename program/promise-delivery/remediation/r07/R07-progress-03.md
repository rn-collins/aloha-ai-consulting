# R07 Progress Report 03 — Regulated Claims Checker Bounded Evaluation

Date: 2026-08-01

Status: passed; R07 remains open

Production origin: `https://aloha-ai-consulting.vercel.app`

Frozen audit baseline: 4,289 promise records / 9,552 occurrences; unchanged

## Unit boundary

This unit evaluates Regulated Claims Checker only as the deterministic, browser-local, English-language, U.S.-focused lexical screen implemented by rule version 1.1.0. It does not determine jurisdiction, product classification, legality, substantiation, premarket status, compliance, or the regulator with authority. A signal is a prompt for human review, and no configured signal is an abstention rather than clearance.

## Disposition and before state

The public page promised risk levels, regulator zones, structure/function overreach, substantiation review, and deceptive-pattern screening, while rule version 1.0.0 only performed case-insensitive substring matching across four short lexicons and returned neither triage levels nor regulator fields. It also lacked a versioned corpus, threshold, error record, abstention contract, reviewer decision, and regression gate.

Disposition: passed-limited for the exact lexical-screening scope after repair to rule version 1.1.0; every broader legal or regulatory inference remains rejected as unsupported.

## Implemented

- Added a thirty-case synthetic corpus covering five visible review categories, multi-category matches, substring boundaries, neutral inputs, and out-of-scope inputs.
- Added deterministic word-boundary matching and repaired the missing `guarantees` inflection.
- Added category, triage level, regulator attention zone, substantiation question, rule version, and an explicit no-match abstention.
- Added a fail-closed threshold requiring 100% case accuracy, 100% per-class recall, zero unexpected category flags, zero false clearances, and 100% abstention accuracy.
- Added FDA and FTC authority records while stating that the tool does not infer product-specific or jurisdiction-specific requirements.
- Published the versioned evaluation record at `/api/evaluations/claims-checker.json`.
- Corrected public copy that implied product-category weighting or an overall risk score, neither of which the tool performs.
- Recorded the Claims Checker as `limited`, not certified or generally compliant, in the canonical release registry.
- Added evaluation and release-state assertions to the release-blocking assurance gate.
- Corrected the shared renderer so both evaluated tools visibly say `bounded evaluation` instead of contradicting the assurance manifest with `not evaluated`.

## Automated results

- 30/30 evaluation cases passed.
- 6/6 required abstentions passed.
- 0 unexpected category flags and 0 false clearances within the declared lexical scope.
- 105/105 repository tests passed.
- 2/5 high-stakes tools now have bounded evaluation decisions.
- 3/5 high-stakes tools remain explicitly unevaluated.
- 7/7 site-assurance domains remain required and uncertified.
- 257 canonical resources and 497 HTML files validated.
- 498 public route surfaces and 9,626 interactive occurrences audited.
- 94/94 represented shared actions remained governed.
- 5,172 current promise records / 11,734 occurrences exactly matched the reviewed release registry.
- Frozen 4,289/9,552 audit baseline preserved.

## Remaining limitations

- The corpus is synthetic and tests deterministic lexical behavior, not legal accuracy, real-world recall, or enforcement prediction.
- The tool cannot identify implied claims expressed with unlisted language and cannot analyze images, surrounding context, negation, quotation, product category, audience, channel, jurisdiction, or evidence.
- The lexicon is English-only and U.S.-focused; the state consumer-protection label is an attention zone, not fifty-state coverage.
- Triage levels are human-review priorities, not probabilities, violation findings, or regulator classifications.
- Product-specific FDA status, FTC substantiation, labeling rules, cannabis restrictions, and state requirements require current primary authority, complete facts, and qualified human review.

## Production verification

PASS within the stated boundary. GitHub `main` evaluation commit `37db494625ff6da5573961758ab69bb150ff891d`, whose tree exactly matched the locally validated tree `a2c823e72bba038f30608c09526482a328e6c328`, deployed through Vercel production deployment `dpl_92djNV5pwmERS88gQZTBuBDh3D3y`. Live verification then detected contradictory visible `not evaluated` labels. Corrective GitHub commit `ce331ec35f254c1576ac39b755bedf10b728ac01`, tree `7b4baf01d022b23c8fb796380f08b0896dc62d89`, deployed through `dpl_DZcrunRaBW3ZTJerawMjEQMSDDgA` and closed that defect.

Production verification established:

- Both deployments reached `READY`, targeted production, and Vercel metadata identified the exact GitHub commits.
- `/`, `/tools/claims-checker`, `/api/evaluations/claims-checker.json`, and `/api/assurance-manifest.json` returned HTTP 200 from the canonical domain.
- The live evaluation reports 30 cases, 30 passes, zero failures, six correct abstentions, zero false clearances, and the `passed-limited-lexical-screening-scope` decision.
- The live assurance manifest reports two evaluated high-stakes tools, Claims Checker as `passed-limited`, three tools as `not-evaluated`, seven uncertified assurance domains, and zero assurance errors.
- The canonical Claims Checker and Citation Verifier pages now publish `bounded evaluation` throughout their visible status surfaces and contain no stale `not evaluated` label.
- No broader compliance, jurisdiction, substantiation, or regulator-authority conclusion is claimed.

R07 Unit 3 is closed. R07 remains open for three tool evaluations and seven evidence-producing site-assurance domains.

Verifier: Codex remediation agent

Retest trigger: any lexicon, matching logic, category, triage level, regulator-zone label, output field, authority boundary, public capability claim, renderer status logic, method, or assurance-schema change; otherwise 2026-11-01.
