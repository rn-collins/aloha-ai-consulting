# R06 Progress Report 01 — Release-Blocking Promise Inventory

Date: 2026-07-31  
Status: locally complete; R06 remains open  
Audit baseline: frozen 4,289 promise records / 9,552 occurrences; unchanged

## Unit boundary

This unit makes the current structural promise inventory release-blocking without rewriting the immutable 2026-07-29 audit baseline. It establishes a separately reviewed current registry for every route, canonical resource, promise signature, and promise occurrence after R01–R05. It does not declare the 325 frozen evidence units terminal, perform the independent clean-room re-audit, certify responsive rendering, deploy the site, or verify production behavior.

## Control defect repaired

The previous `site:ci` command ended with `promise:check`. That command correctly compares generated output with the immutable baseline, but it necessarily failed after legitimate remediation added routes, lessons, actions, and claims. The GitHub workflow also used a narrow path filter, allowing changes to other promise-bearing files to bypass the full gate.

R06 now separates two controls:

- `promise:check` remains the immutable baseline comparison and diagnostic.
- `promise:release-check` compares the current generated estate with an explicitly reviewed release registry.

The current gate fails closed for:

- an added unrecorded promise signature;
- a removed reviewed promise signature;
- a changed route occurrence set;
- route inventory drift;
- count or record-hash drift;
- a missing registry;
- an unsupported schema;
- a missing approval decision, reviewer, date, or review boundary; or
- mutation of the frozen 4,289/9,552 baseline reference.

## Reviewed current inventory

- 498 public route surfaces
- 257 canonical resources
- 9,625 interactive occurrences
- 5,125 grouped promise records
- 11,689 total promise occurrences
- 5,125 unique reviewed promise IDs
- Zero unrecorded current signatures

The registry records each promise's stable ID, category, exact text, and hashed occurrence set. Its review boundary is repository-local structural coverage only. It does not certify factual accuracy, legal sufficiency, responsive rendering, deployment, live behavior, maintained monitoring, enrollment, grading, credentials, external integrations, or service capacity.

## CI enforcement

- The full `site:ci` chain now ends with `promise:release-check`.
- Pull requests and pushes to `main` no longer use narrow path filters; the governed pipeline runs regardless of which repository path changed.
- The immutable baseline files remain unchanged and separately test-protected.
- An R06 regression test verifies registry uniqueness, occurrence coverage, provenance, baseline preservation, full-workflow triggering, and the correct release gate.

## Validation evidence

- 102/102 tests passed
- Release-control gates passed
- 7/7 learning courses remained complete
- 257 resources and 569 relationships validated
- 497 HTML files validated
- 498 pages and 9,625 interactions audited
- 94/94 represented actions governed
- Presentation-system audit passed
- Current promise release check passed at 5,125 records / 11,689 occurrences
- Frozen audit controls preserved at 4,289 / 9,552
- Complete `site:ci` pipeline exited successfully

## R06 remaining work

1. Reconcile all 325 frozen evidence units to explicit terminal or blocked states with evidence and dependency lineage.
2. Complete responsive desktop, tablet, and mobile rendered-browser inspection.
3. Commit, review, merge, and deploy only with explicit authorization.
4. Perform production verification against the deployed estate.
5. Run the independent clean-room inventory from the production surface.
6. Require zero unrecorded signatures and reconcile clean-room results to the frozen and current registries before program closure.

## Change authority

No commit, push, deployment, production verification, or clean-room closure was performed.
