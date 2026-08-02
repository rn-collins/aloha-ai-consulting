# R07 Progress Report 10 — Corrections Assurance

Date: 2026-08-02

Status: passed within the documented public-process and checked-in-ledger-integrity boundary and verified in production; Unit 10 closed; R07 remains open

Frozen audit baseline: 4,289 promise records / 9,552 occurrences; unchanged

## Scope and decision

Unit 10 evaluated whether Aloha AI has an operable public correction route and a durable control that preserves superseded states, identifies affected outputs, records response state and ownership, and requires closure evidence. The unit does not claim that every historical or current error has been discovered, that every correction is substantively correct, or that cached, copied, downloaded, indexed, third-party, confidential, or future outputs have been corrected.

Disposition: passed-limited for the dated public correction process and checked-in ledger-integrity boundary after remediation and production verification.

## Material findings and remediation

The existing Methods page described report, review, and resolution in prose, while individual monitors exposed empty correction arrays. Those pieces did not provide:

- a public site-wide correction route;
- a private no-meeting reporting instruction;
- a controlled response-state model;
- a versioned public correction ledger;
- required prior/corrected states, authority, root cause, affected-output dispositions, prevention controls, and notification limits; or
- a release-blocking test that prevents a closed correction without closure evidence.

The new `/corrections` policy and `/api/corrections.json` ledger implement those controls. The ledger was seeded only with two material corrections reconstructable from committed evidence: Privacy disclosure/request-path drift and the Security production module-runtime failures. Ordinary edits, unpublished drafts, confidential client work, and unverified historical assumptions were not converted into invented correction records.

## Evidence and controls

- `scripts/evaluate-corrections-assurance.js` fails release on a missing reporting path, invalid state, incomplete ledger entry, absent affected-output disposition, or closed correction without commit and evidence references.
- `/api/evaluations/corrections.json` and its canonical content copy record the scope, exclusions, owner, route, ledger counts, affected-output analysis, response states, closure-evidence threshold, checks, findings, review trigger, and prohibited inference.
- `/api/corrections.json` publishes the bounded machine-readable ledger without representing it as a complete edit or error history.
- The assurance registry records Corrections as `passed-limited`, not certified.
- The release-control test requires Privacy, Security, Accessibility, and Corrections to remain bounded while Legal Authority, Rights and Attribution, and Institutional Credentials continue to fail closed.

## Local acceptance result

- 12/12 bounded Corrections checks passed.
- Two evidence-backed ledger entries passed structural review.
- Six affected public outputs have explicit dispositions.
- 105/105 repository tests passed.
- 499/499 sitemap routes plus the recovery surface passed structural review.
- 9,678 interactions passed destination and action-contract review.
- The current promise registry is exactly reconciled at 5,304 records / 11,894 occurrences.
- The immutable 4,289-record / 9,552-occurrence baseline remains unchanged.

## Production verification

PASS within the stated boundary. GitHub `main` evaluation commit `a0f5673733dfdc19247410fe64fab774e20c6e7a` has Git tree `56410670b3e79dfc2641aef9588b4809cee5b3b4`, exactly matching the locally tested tree. It deployed through Vercel production deployment `dpl_9kmg9ofG8w3zMz953ienL6inP8V8`.

Production verification established:

- The deployment reached `READY`, targeted production, and Vercel metadata identified exact GitHub commit `a0f5673733dfdc19247410fe64fab774e20c6e7a`.
- `/corrections`, `/api/corrections.json`, `/api/evaluations/corrections.json`, and `/api/assurance-manifest.json` returned HTTP 200 from the canonical domain.
- The live policy publishes the private “correction report — no meeting needed” instruction, response states, required record fields, affected-output review, closure threshold, notification behavior, public-ledger route, and explicit limits.
- The live ledger contains two closed evidence-backed correction records with six affected-output dispositions, preserved prior and corrected states, authority, root cause, prevention controls, commit evidence, notification boundaries, and limitations.
- The live evaluation reports 12 checks, 12 passes, zero failures, two ledger entries, six affected outputs, and the explicit prohibition against inferring an error-free site or complete historical correction coverage.
- The live assurance manifest reports four boundedly evaluated site-assurance domains, three remaining required domains, zero certified domains, and zero errors.

R07 Unit 10 is closed.

R07 remains open for three evidence-producing site-assurance domains after this unit closes: legal authority, rights and attribution, and institutional credentials.
