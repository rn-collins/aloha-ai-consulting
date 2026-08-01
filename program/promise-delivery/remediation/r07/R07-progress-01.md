# R07 Progress Report 01 — Assurance and Methods Foundation

Date: 2026-07-31

Status: local gates passed; production release pending

Baseline production commit: `531398bc0a58409ce792c32e32343e596be68f34`

Baseline production deployment: `dpl_EjidnpFik39j1TvwfZxWzZpxCquF`

Production origin: `https://aloha-ai-consulting.vercel.app`

Frozen audit baseline: 4,289 promise records / 9,552 occurrences; unchanged

## Unit boundary

This unit creates the shared assurance structure required before individual tool evaluations or site-wide privacy, security, accessibility, legal-authority, rights, credential, or correction certifications can be accepted. It converts Methods from an editorial standard into a versioned, release-enforced conformance contract. It does not certify site-wide conformance or claim that any high-stakes tool has passed an evaluation.

## Disposition and before state

The Methods page described sources, logic, evaluation, governance, and maintenance, but carried no method version, effective date, owner, review trigger, conformance record, exception ledger, or release gate. The five R07-priority tools remained correctly marked not evaluated, but no single canonical queue defined the evidence each must produce.

Disposition: completed foundation; evaluation and domain certification deferred to evidence-producing R07 units.

## Implemented

- Versioned Methods 1.0.0 with owner, effective date, review trigger, privacy boundary, and machine-readable evidence links.
- Added twelve canonical method-conformance controls spanning decision framing through maintenance or retirement.
- Added an empty explicit exception ledger and first revision record.
- Added one stable evaluation queue for Citation Verifier, Regulated Claims Checker, Evidence Explainer, Regulatory Bill Analyzer, and Controlled Substances Explainer.
- Preserved all five tools as `not-evaluated` and recorded the evidence required for their next decisions.
- Added seven fail-closed assurance domains: privacy, security, accessibility, corrections, legal authority, rights and attribution, and institutional credentials.
- Added `/api/assurance-manifest.json` and an `assurance:check` release gate to the complete CI pipeline.

## Automated results

- 105/105 repository tests passed.
- 12/12 method controls passed schema and evidence-requirement validation.
- 5/5 priority high-stakes tools remain explicitly queued and unevaluated.
- 7/7 site-assurance domains remain explicitly required and not yet certified.
- 257 release objects, 4,289 frozen claims, and 287 site-system contracts passed release controls.
- 7/7 open-material courses remained complete.
- 497 HTML files validated.
- 498 public surfaces and 9,626 interactive occurrences audited.
- 94/94 represented shared actions remained governed.
- 5,137 current promise records / 11,693 occurrences exactly matched the reviewed release registry.
- Frozen 4,289/9,552 audit baseline preserved.

## Remaining limitations

- No high-stakes tool evaluation is complete in this unit.
- No site-wide privacy, security, accessibility, corrections, legal-authority, rights, or credential certification is granted.
- Methods conformance must be instantiated and evidenced object by object; publication of the method alone proves nothing about implementation.
- Rendered responsive and live API verification remain required after deployment.

## Local decision

PASS for production-candidate release. Final round decision requires commit, main-branch deployment, live Methods and assurance-manifest verification, and recorded production evidence.

Verifier: Codex remediation agent

Retest trigger: any material method, assurance schema, evaluation, privacy, accessibility, legal-authority, rights, credential, or release-control change; otherwise 2026-10-31.
