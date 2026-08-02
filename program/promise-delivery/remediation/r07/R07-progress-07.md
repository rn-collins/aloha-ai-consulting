# R07 Progress Report 07 — Privacy Assurance

Date: 2026-08-02

Status: passed within the documented public-site technical and policy boundary and verified in production; Unit 7 closed; R07 remains open

Frozen audit baseline: 4,289 promise records / 9,552 occurrences; unchanged

## Unit boundary

This unit evaluates the canonical public-site routes, checked-in browser runtime, Vercel configuration, disclosed Microsoft Bookings path, and deployed-but-unlinked platform API foundations. It does not certify jurisdiction-specific legal compliance; Microsoft, Northeastern, Vercel, Supabase, or destination-provider internal behavior; client systems; satellite deployments; or future releases.

## Findings and disposition

The privacy policy accurately disclosed Vercel Speed Insights, but the historical governance note incorrectly said Speed Insights had been removed. The policy also directed deletion requests to email even though the site intentionally publishes no email channel. Deployed platform foundations included callable sign-up and sign-in handlers despite the public Workspace being marked unavailable.

Disposition: passed-limited for the dated public-site boundary after correction. No comprehensive privacy-compliance certification is granted.

## Implemented

- Reconciled the historical governance note with the actual 257-route Vercel Speed Insights deployment.
- Replaced nonexistent email instructions with a disclosed interim Microsoft Bookings privacy-request path and a separate incident-report path; no meeting is required.
- Disclosed the unlinked platform API foundations and their operational boundary.
- Gated public sign-up and sign-in behind `PLATFORM_PUBLIC_AUTH_ENABLED=true`; both fail closed by default.
- Confirmed authenticated platform data routes require a valid session and external model delivery remains disabled.
- Added a machine-readable seven-flow data inventory covering first-party delivery, Speed Insights, browser tools, session attribution, Microsoft Bookings, platform foundations, and external navigation.
- Added a deployed script/network inventory across 498 HTML files, runtime JavaScript, CSP, advertising-tracker signatures, and all 16 platform API files.
- Added the privacy evaluation to the release-blocking assurance gate and published matching canonical and API evidence records.
- Updated assurance reporting to distinguish a bounded evaluated domain from legal or comprehensive certification.

## Automated results

- 12/12 privacy assurance checks passed.
- 498 checked-in HTML files and 257 Speed Insights routes inventoried.
- 16 platform API files inventoried; at least 10 data routes require authenticated sessions.
- Zero Google Analytics, Google Tag Manager, Meta Pixel, Hotjar, or Microsoft Clarity tracker signatures found in the checked runtime.
- 1/7 site-assurance domains now has a bounded evaluation decision; six remain required and unevaluated.
- 105/105 repository tests passed.
- 497 sitemap HTML pages plus recovery, 9,627 interactions, shared actions, and presentation QA passed.
- Current promise release registry reconciled at 5,255 records / 11,833 occurrences.
- Frozen 4,289/9,552 audit baseline preserved.

## Remaining limitations

- Repository inspection cannot establish the internal retention, logging, or processing behavior of hosting, booking, identity, persistence, or destination providers.
- The interim privacy and incident path depends on Microsoft Bookings and should be replaced by a brand-owned channel before server-side intake or public authentication is activated.
- Speed Insights behavior and provider terms can change independently of this repository.
- CSP permissions identify allowed destinations but do not prove that a specific route makes a request.
- Client systems and separately deployed satellites require their own data-flow and privacy reviews.

## Production verification

PASS within the stated boundary. GitHub `main` evaluation commit `73a9028e5fc9e6e3a8518caa300b0cadde438fd4`, whose remote tree exactly matched the locally tested tree, deployed through Vercel production deployment `dpl_Gcbyb7Qjo6XChMQ1HNwMvZ7iDyqL`.

Production verification established:

- The deployment reached `READY`, targeted production, and Vercel metadata identified the exact GitHub commit.
- `/privacy`, `/api/evaluations/privacy.json`, and `/api/assurance-manifest.json` returned HTTP 200 from the canonical domain.
- The live privacy page discloses Vercel Speed Insights, browser-local processing, Microsoft Bookings, disabled public authentication, the interim privacy-request path, and the incident-report path.
- The live privacy evaluation reports 12 checks, 12 passes, zero failures, seven inventoried data flows, 257 Speed Insights routes, zero advertising-tracker hits, and the `passed-limited-public-site-boundary` decision.
- The live assurance manifest reports one boundedly evaluated site-assurance domain, six remaining required domains, zero certified domains, and zero assurance errors.
- The live record preserves the explicit boundary that this is not a legal-compliance certification or a certification of third-party, client, satellite, or future-system behavior.

R07 Unit 7 is closed. R07 remains open for six evidence-producing site-assurance domains: security, accessibility, corrections, legal authority, rights and attribution, and institutional credentials.

Verifier: Codex remediation agent

Retest trigger: any script, form, storage, cookie, analytics, API, authentication, CSP, booking, third-party destination, privacy copy, assurance schema, or deployment change; otherwise 2026-11-02.
