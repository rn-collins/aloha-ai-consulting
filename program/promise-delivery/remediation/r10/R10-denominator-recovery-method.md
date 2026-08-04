# R10 Controlled Denominator-Recovery Method

## Decision

The frozen denominator of 325 evidence units is preserved, but the missing original rows are not recreated by inference. The recovery register creates 325 stable reconstruction slots and maps every one of the 4,289 immutable promise records to exactly one slot.

## Source search

The original row-level register was sought in the checked-in program files, available Git objects and paths, retained workspace control packages, generated audit artifacts, and all R01-R09 progress reports. Those sources preserve the number 325 and a small set of later evidence-contract names, but not the original 325 rows or their evidence decisions.

## Deterministic construction

1. Read `program/promise-delivery/ledger.json`, fixed to baseline commit `deb1073d`.
2. Require exactly 4,289 unique frozen promise IDs.
3. Sort those IDs lexicographically.
4. Partition the sorted sequence contiguously into 325 slots. The first 64 slots contain 14 records; the remaining 261 contain 13.
5. Assign stable IDs `R10-REC-001` through `R10-REC-325`.
6. Preserve every promise ID exactly once and record a SHA-256 hash of the ordered ID sequence.

## Evidentiary boundary

The recovered rows establish denominator integrity and exhaustive frozen-promise lineage. They do not establish the identity, scope, finding, or terminal decision of any missing original evidence unit. Every slot therefore remains `deferred` with the same explicit dependency and reconsideration trigger.

A slot may move to `passed` only after the original row is restored with verifiable lineage or every assigned promise is independently re-audited and observable evidence is recorded. Repository-wide tests, route checks, or current-site health cannot by themselves satisfy that requirement.

## Independent re-audit phase 1: current-registry lineage

Each frozen promise ID is compared with the current reviewed promise-release registry. A verbatim survivor receives a direct registry evidence pointer and its current occurrence-key count. A non-surviving ID receives an explicit open decision: determine whether remediation intentionally retired it, rewrote it into a successor, or omitted it.

This phase is exhaustive but deliberately narrow. Verbatim presence establishes lineage, not factual accuracy, legal sufficiency, operational capacity, or production behavior. No slot changes terminal state until every promise in that slot also completes the applicable substantive review.

## Independent re-audit phase 5: canonical resource-field continuity

For unresolved resource claims only, a frozen promise is linked to a current successor when every frozen occurrence resolves to an existing canonical resource and the same exact field path, every current field value is a claim string represented in the reviewed registry, and all occurrences converge on one current promise ID. This rule does not use text similarity and does not apply to removed fields, non-string values, missing resources, or divergent successors.

Field continuity proves which current claim replaced a claim at a stable schema location. It does not prove the current claim true or sufficient. Every matched promise therefore continues to require substantive review, and no reconstructed slot changes terminal state from lineage evidence alone.
