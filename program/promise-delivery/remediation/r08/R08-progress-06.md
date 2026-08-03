# R08 Progress Report 06 — Tool and Assessment Delivery Evidence Boundary

Date: 2026-08-02

Status: passed within the twenty-three-resource tool and assessment boundary after exact-tree GitHub publication and production verification; Unit 6 closed; R08 remains open

Frozen audit baseline: 4,289 promise records / 9,552 occurrences; unchanged

## Unit boundary

This unit governs every canonical resource currently classified as a tool or assessment. It distinguishes working browser-local tools and directional assessments from a public demonstration without a visitor input action and from reference-only framework pages whose interactive access is unavailable. It requires exact registry coverage, generated canonical destinations, substantive metadata, evidence, methodology, limitations, release review metadata, accurate permitted language, a checked-in primary action and input/output or scoring contract for browser-local experiences, and a rendered release boundary on every page.

It does not certify professional advice, legal or factual correctness, external integration, validated measurement, consequential fitness, independent browser execution, production network operation, or delivery of separately deferred commercial artifacts.

## Defect found

The site already rendered conservative per-resource release states, and individual high-risk tools had bounded assurance evaluations, but no single release-blocking control reconciled the complete tool and assessment estate to its actual delivery mode. A reference framework could therefore remain classified as a tool without an explicit estate-level check preventing it from being treated as interactive, while a browser-local experience could lose its primary checked-in action or input/output contract without failing the Builds evidence gate.

## Remediation completed

- Added a versioned register covering all 23 canonical tools and assessments.
- Classified 17 experiences as working browser-local tools or directional assessments, one as a public demonstration without a visitor input action, and five as reference-only pages with interactive access unavailable.
- Added a fail-closed evaluator for exact coverage, canonical pages, substantive metadata, release metadata, action contracts, input/output or scoring contracts, reference and demonstration boundaries, and rendered status language.
- Published the register through a public JSON route and generated a machine-readable evaluation artifact.
- Added the evaluator to the complete Builds/release CI path.
- Preserved the separate R07 bounded evaluations for five high-stakes tools; this estate-level control does not replace or broaden those assurance decisions.

## Local evidence

- Tool-delivery evaluator: 11/11 checks passed.
- Canonical resources: 23 total — 16 tools and 7 assessments.
- Delivery modes: 17 browser-local, 1 demonstration-only, 5 reference-only.
- Evaluator findings: 0.
- Repository tests: 105/105 passed.
- Canonical resources sitewide: 262.
- Sitemap routes: 504; public surfaces including recovery: 505.
- Generated HTML files validated: 504.
- Interactions: 9,782; all destination and state contracts resolved.
- Current promise registry: 5,368 records / 12,013 occurrences, exactly reconciled.
- Immutable baseline: 4,289 records / 9,552 occurrences, unchanged.

## Production verification

- GitHub `main` implementation commit: `03fa7f00221f7c940980086db56d3e7a4d679ae2`.
- Exact published Git tree: `b8aa16e28c9d311aeacd529f16e43c88f33eb258`.
- Vercel production deployment: `dpl_63kXRAAd7tpeLHVALZ6PKTuGjCai`, state `READY`, target `production`, with Git metadata tied to the exact implementation commit.
- `/artifacts/tool-delivery-evidence-evaluation.json`, `/api/tool-delivery-evidence-register.json`, `/api/release-control-report.json`, and `/program/promise-delivery/promise-release-registry.json` returned HTTP 200.
- The live evaluator reported 11/11 checks, 23 canonical resources, 16 tools, 7 assessments, 17 browser-local experiences, 1 demonstration-only page, 5 reference-only pages, and zero findings.
- Live release totals matched 262 resources and 5,368 promise records / 12,013 occurrences; release-control errors remained zero.
- Vercel reported no runtime errors for the project in the verification window.
- Browser-control tooling was not exposed in this session, so this verification does not claim independent field entry, button activation, result inspection, screenshot, browser-console capture, responsive-layout review, or visual-design certification.

## Remaining R08 work

- Continue substantive destination and artifact-depth review for represented resource families outside the tool and assessment estate.
- Independently exercise browser-local actions in a browser-capable verification runtime when available.
- Keep five reference-only tool-labelled resources and separately deferred commercial artifacts from implying present interactive or commercial delivery.

## Decision

PASS within the stated twenty-three-resource boundary. Unit 6 is production-closed. R08 remains open.
