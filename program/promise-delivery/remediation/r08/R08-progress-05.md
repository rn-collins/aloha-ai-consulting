# R08 Progress Report 05 — Public Download and Export Evidence Boundary

Date: 2026-08-02

Status: passed within the 34-route public download/export boundary after exact-tree GitHub publication and production verification; Unit 5 closed; R08 remains open

Frozen audit baseline: 4,289 promise records / 9,552 occurrences; unchanged

## Unit boundary

This unit governs every export action represented on the current generated public site: browser-generated tool review records, monitor coverage records, learning self-records, the Agent Role Contract, and the Citation Verifier lab kit. It requires exact action coverage, a generated public route, the shared fail-closed browser runtime, nonempty content and filename contracts, a declared MIME type and version, and an explicit license or use boundary.

It does not execute a real browser save dialog; certify the visitor's device, browser, filesystem, or downloaded copy; turn a self-record into a submission, grade, credential, certification, or professional opinion; create a server-side stored record; or make any separately deferred commercial artifact available.

## Defect found

The release suite verified that export-labelled pages loaded the shared browser action runtime, but it did not maintain a canonical route-and-action register or fail the release when a named download lacked content, filename, format, version, or use-boundary metadata. A future generated action could therefore retain a plausible button while losing the substantive file contract required by the program's template/download acceptance criteria.

## Remediation completed

- Added a versioned 34-route public download evidence register covering all 38 generated export actions.
- Added a fail-closed evaluator for exact action coverage, unique routes, generated destinations, shared-runtime loading, action-to-contract cardinality, content, filename, MIME type, version, use/license boundary, and object-URL lifecycle controls.
- Included linked route scripts in the contract inspection so the University scoping-record download is governed at its actual implementation boundary rather than falsely treated as missing because its code is not inline.
- Added the evaluator to the complete Builds/release CI path.
- Preserved the existing boundary for deferred commercial artifacts: no checkout, purchase, license, or download is represented as currently available.

## Local evidence

- Public download evaluator: 10/10 checks passed.
- Governed public routes: 34.
- Represented export actions: 38/38 exactly reconciled.
- Export families: governance template, monitor coverage record, tool review record, learning self-record, and open-learning template.
- Required fields per browser download contract: content, filename, MIME type, version, and license/use boundary.
- Evaluator findings: 0.
- Repository tests: 105/105 passed.
- Canonical resources: 262.
- Sitemap routes: 504; public surfaces including recovery: 505.
- Generated HTML files validated: 504.
- Interactions: 9,782; all destination and state contracts resolved.
- Shared represented actions: 94, including 38 exports; all governed by the shared runtime.
- Current promise registry: 5,368 records / 12,013 occurrences, exactly reconciled.
- Immutable baseline: 4,289 records / 9,552 occurrences, unchanged.

## Production verification

- GitHub `main` implementation commit: `390fe33eb592fee7184b92fc68e83bae7db204b0`.
- Exact published Git tree: `2fee6732521cb1f3c6c4c503e152e263049519b6`.
- Vercel production deployment: `dpl_F6YGYAPuxvLb9khLJ8VAeEEgjczd`, state `READY`, target `production`, with Git metadata tied to the exact implementation commit.
- `/artifacts/public-download-evidence-evaluation.json`, `/api/public-download-evidence-register.json`, `/api/release-control-report.json`, and `/program/promise-delivery/promise-release-registry.json` returned HTTP 200.
- The live evaluator reported 10/10 checks, 34 governed routes, 38 represented actions, five delivery families, and zero findings.
- Live release totals matched 262 resources, 505 public surfaces including recovery, 9,782 interactions, and 5,368 promise records / 12,013 occurrences; release-control errors remained zero.
- Vercel reported no runtime errors for the project in the verification window.
- Browser-control tooling was not exposed in this session, so this verification does not claim an independent button click, saved-file inspection, screenshot, browser-console capture, responsive-layout review, or visual-design certification.

## Remaining R08 work

- Inventory represented assets outside this bounded download/export family.
- Continue substantive artifact-depth and canonical-destination review in dependency order.
- Keep deferred commercial artifacts governed until their real files, licensing, acquisition paths, and production actions meet acceptance criteria.

## Decision

PASS within the stated 34-route, 38-action boundary. Unit 5 is production-closed. R08 remains open.
