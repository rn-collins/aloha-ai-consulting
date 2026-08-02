# R07 progress 12 — Rights and Attribution

Date: 2026-08-02

Status: passed locally within the documented public rights-process, selected rights-class, third-party-reference, and checked-in visual-asset inventory boundary; production verification pending; R07 remains open

## Decision boundary

Unit 12 evaluates whether Aloha AI publishes and release-enforces a bounded rights and attribution process, records selected material classes and third-party references, and inventories checked-in public image and vector assets with stable hashes. It does not constitute copyright registration, chain-of-title review, a trademark search, a fair-use or public-domain legal opinion, a dependency-license audit, or a determination of originality, ownership, permission, license compatibility, enforceability, or non-infringement.

## Remediation completed

- Published a structured Rights and Attribution policy at `/rights-attribution`.
- Added a machine-readable rights register at `/api/rights-attribution-register.json`.
- Distinguished first-party authored expression, first-party generated visuals, public authorities and facts, visitor-supplied material, and open-source dependencies.
- Recorded third-party-name and mark boundaries for Microsoft, Microsoft Bookings, Vercel, GitHub, Supabase, and Beehiiv without implying endorsement or authorizing logo use.
- Added visitor reuse and browser-generated-download terms without converting public access into a broad license.
- Added a private rights-report path using the current Bookings channel and the instruction `rights report — no meeting needed`.
- Added an estate evaluator that inventories checked-in PNG, JPG, JPEG, SVG, WOFF, WOFF2, and PDF assets, records SHA-256 hashes, and fails closed on missing provenance fields or inventory drift.
- Integrated Rights and Attribution as the sixth bounded R07 site-assurance domain while keeping Institutional Credentials failed closed.

## Local evidence

- Rights and Attribution evaluator: 12/12 checks passed.
- Checked-in public visual assets: 61 inventoried; 61 hashed; 0 record findings.
- Repository tests: 105/105 passed.
- Site audit: 503/503 sitemap routes found; 100% average structural score; zero critical structural or accessibility failures.
- Interaction audit: 504 public surfaces; 9,753 interactions; all destinations and state contracts resolved.
- Release registry: 261 governed resources.
- Current promise registry: 5,344 records / 11,979 occurrences across 504 public surfaces, exactly reconciled.
- Immutable audit baseline: 4,289 records / 9,552 occurrences, unchanged.

## Production closure requirement

The unit remains open until the exact tested tree is committed and published, the production deployment is tied to that commit and reaches `READY`, the policy/register/evaluation/assurance endpoints are verified live, and those production facts are added to this record in a closure-only commit.

## Remaining R07 work

After Unit 12 closes, one R07 assurance domain remains: Institutional Credentials.
