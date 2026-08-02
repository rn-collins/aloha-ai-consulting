# R07 Progress Report 11 — Legal Authority Assurance

Date: 2026-08-02

Status: passed locally within the documented public-process and selected-authority-register boundary; production verification pending; Unit 11 remains open; R07 remains open

Frozen audit baseline: 4,289 promise records / 9,552 occurrences; unchanged

## Scope and decision

Unit 11 evaluated whether Aloha AI publishes and release-enforces a source hierarchy, jurisdiction and effective-state record, retrieval date, conflict rule, professional boundary, review owner, and prohibited-inference boundary for selected high-stakes legal statements. It does not constitute a complete proposition-level legal research audit of every page, independent citator review, a good-law determination, legal advice, an attorney-client relationship, or a matter-specific conclusion about applicability, permission, prohibition, liability, or compliance.

Local disposition: passed-limited for the dated public process and selected authority-register integrity boundary. Production disposition remains pending until the exact tested tree is published and verified.

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

Pending. The required GitHub publishing workflow cannot commit or push in the current environment because the `gh` CLI is not installed and authenticated. No production commit or deployment is claimed.

R07 Unit 11 remains open until exact-tree publication, Vercel production readiness, and live verification of the policy, register, evaluation evidence, and assurance manifest are recorded.

Two R07 assurance domains remain after local evaluation: Rights and Attribution and Institutional Credentials.
