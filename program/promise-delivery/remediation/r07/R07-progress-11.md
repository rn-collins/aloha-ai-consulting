# R07 Progress Report 11 — Legal Authority Assurance

Date: 2026-08-02

Status: passed within the documented public-process and selected-authority-register boundary after exact-tree publication and production verification; Unit 11 closed; R07 remains open

Frozen audit baseline: 4,289 promise records / 9,552 occurrences; unchanged

## Scope and decision

Unit 11 evaluated whether Aloha AI publishes and release-enforces a source hierarchy, jurisdiction and effective-state record, retrieval date, conflict rule, professional boundary, review owner, and prohibited-inference boundary for selected high-stakes legal statements. It does not constitute a complete proposition-level legal research audit of every page, independent citator review, a good-law determination, legal advice, an attorney-client relationship, or a matter-specific conclusion about applicability, permission, prohibition, liability, or compliance.

Disposition: passed-limited for the dated public process and selected authority-register integrity boundary after exact-tree publication and production verification.

## Material findings and remediation

The prior estate contained scattered non-advice and qualified-review language but no canonical public legal-authority policy, machine-readable source register, conflict protocol, or release-blocking authority evaluator. Unit 11 added:

- `/legal-authority`, defining the professional boundary, primary-authority hierarchy, jurisdiction/version/effective-state protocol, conflict handling, tool and explainer limits, and review/correction path;
- `/api/legal-authority-register.json`, initially containing two selected, bounded authority records for Federal Rule of Civil Procedure 11 and federal controlled-substance scheduling sources;
- `/api/evaluations/legal-authority.json`, recording scope, exclusions, checks, findings, review triggers, and prohibited inference; and
- a release-blocking evaluator and assurance-control integration that keep Rights and Attribution and Institutional Credentials failed closed.

The register is explicitly selected rather than represented as a complete sitewide legal-research inventory. Each record preserves jurisdiction, authority type and title, official source, retrieval date, effective-state boundary, conflicts or exclusions, review owner, public surfaces, and professional-review requirement.

## Local acceptance result

- 12/12 bounded Legal Authority checks passed.
- Two selected authority records passed required-field review with zero findings.
- 105/105 repository tests passed.
- 501/501 sitemap routes plus the recovery surface passed structural review.
- 9,715 interactions passed destination and action-contract review.
- 260 governed canonical resources passed release controls.
- The current promise registry is exactly reconciled at 5,320 records / 11,936 occurrences across 502 public surfaces.
- The immutable 4,289-record / 9,552-occurrence baseline remains unchanged.

## Production verification

- Evaluation commit: `58373a48d6cff02e87017b5e3d325ddbb6c4ef75`.
- The GitHub evaluation tree is `e562f1f048f39017b00947f3760fe3ab85bfcb68`, exactly matching the locally tested tree.
- Production deployment: `dpl_38fgkJiXd1MaCGfhgkcMrFdEqxyp`, state `READY`, target `production`, tied to the exact evaluation commit.
- The canonical `/legal-authority` policy, `/api/legal-authority-register.json`, `/api/evaluations/legal-authority.json`, and `/api/assurance-manifest.json` each returned HTTP 200 in production.
- Live evidence reported 12/12 checks passed, zero failed checks, two registered authority records, and zero record findings.
- The live assurance manifest reported five evaluated assurance domains, zero certified domains, and kept Rights and Attribution and Institutional Credentials unevaluated and failed closed.
- The live professional boundary and prohibited-inference language remained intact.

R07 Unit 11 is closed. Two R07 assurance domains remain: Rights and Attribution and Institutional Credentials.
