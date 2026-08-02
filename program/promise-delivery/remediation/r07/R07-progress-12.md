# R07 progress 12 — Rights and Attribution

Date: 2026-08-02

Status: passed within the documented public rights-process, selected rights-class, third-party-reference, and checked-in visual-asset inventory boundary after exact-tree publication and production verification; Unit 12 closed; R07 remains open

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

## Production verification

- Evaluation commit: `83a1003a507909d20b325356baf710ca0ff1c05e`.
- The GitHub evaluation tree is `4242e548990a281a0e196c11d4d139ae4a72d493`, exactly matching the locally tested tree.
- Production deployment: `dpl_85AEPMdmgpyVQW6nM7mn5v7oujgd`, state `READY`, target `production`, tied to the exact evaluation commit.
- The canonical `/rights-attribution` policy, `/api/rights-attribution-register.json`, `/api/evaluations/rights-attribution.json`, and `/api/assurance-manifest.json` each returned HTTP 200 in production.
- Live evidence reported 12/12 checks passed, zero failed checks, five rights classes, two third-party-reference records, and 61/61 checked-in public visual assets hashed with zero record findings.
- The live evidence preserved the exclusions against copyright registration, chain-of-title review, trademark clearance, fair-use or public-domain opinion, dependency-license audit, and any inference of originality, ownership, permission, license compatibility, enforceability, or non-infringement.
- The live assurance manifest reported six bounded assurance domains, zero certified domains, and kept Institutional Credentials unevaluated and failed closed.

R07 Unit 12 is closed. One R07 assurance domain remains: Institutional Credentials.

## Remaining R07 work

After Unit 12 closes, one R07 assurance domain remains: Institutional Credentials.
