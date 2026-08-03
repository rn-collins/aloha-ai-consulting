# R07 progress 13 — Institutional Credentials

Date: 2026-08-02

Status: passed within the documented selected-public-claim inventory, evidence-class disclosure, and exact-claim mapping boundary after exact-tree GitHub publication and production verification; Unit 13 closed; R07 closed

## Decision boundary

Unit 13 evaluates whether Aloha AI publishes and release-enforces a bounded institutional-credentials and affiliations process, records selected public claim families, distinguishes evidence classes, maps every configured public claim occurrence to a controlled record, and removes language broader than the documented evidence. It does not independently verify identity, transcripts, degrees, enrollment, employment, appointments, memberships, licensure, certifications, publication-review methods, current institutional standing, endorsements, or every biographical statement.

## Remediation completed

- Published a structured Institutional Credentials policy at `/institutional-credentials`.
- Added a machine-readable credentials register at `/api/institutional-credentials-register.json`.
- Added six bounded records covering the completed MS claim, current JD-candidate claim, historical psychedelic-clinical-science regulatory experience, legal-research and Harvey workflow experience, publication experience, and Aloha AI's non-credentialing learning-status boundary.
- Distinguished person-specific institution-issued evidence, official program-existence evidence, publisher-hosted evidence, third-party public corroboration, private work records, and checked-in product behavior.
- Recorded status dates, scope, owners, change triggers, public corroboration, and prohibited inferences without exposing or pretending to inspect private records.
- Removed the broader-than-established phrase `peer-reviewed publications` and replaced it with `published articles and public writing`.
- Added a fail-closed evaluator that inventories configured credential and affiliation language across canonical content, hashes each occurrence, maps each claim to controlled variants, and blocks unmatched claims, duplicate variant ownership, stale records, incomplete evidence descriptions, or restored overbroad peer-review language.
- Integrated Institutional Credentials as the seventh bounded R07 site-assurance domain.
- Added the 262nd canonical release object and rebuilt all nine governed hydration snapshots so the policy survives a clean checkout and CI hydration.

## Local evidence

- Institutional Credentials evaluator: 13/13 checks passed.
- Credential register: 6 records.
- Configured public claim occurrences: 88; 88 mapped; 0 unmatched; 0 ambiguous claim variants; 0 record findings.
- Repository tests: 105/105 passed.
- Site audit: 504/504 sitemap routes found; 100% average structural score; zero critical structural or accessibility failures.
- Interaction audit: 505 public surfaces; 9,782 interactions; all destinations and state contracts resolved.
- Shared-action audit: 505 pages; 94 represented actions; all contracts resolved.
- Release registry: 262 governed resources.
- Current promise registry: 5,368 records / 12,013 occurrences across 505 public surfaces, exactly reconciled.
- Immutable audit baseline: 4,289 records / 9,552 occurrences, unchanged.
- Assurance manifest: five of five high-stakes tools evaluated within bounded scope; seven of seven site-assurance domains passed within bounded scope; zero certified domains.

## External-source boundary

- Boston University official materials establish that the MS in Anatomy & Neurobiology program exists; they do not identify RN's individual completion status.
- Northeastern Law official materials establish that the FlexJD program exists and is a part-time JD program; they do not identify RN's individual enrollment status.
- Publisher-hosted contributor pages publicly corroborate selected RN biography claims; they are not institution-issued transcripts or enrollment verifications.
- Private person-specific and work records were not checked into, exposed, or independently inspected by this repository assurance unit.

## Production verification

- GitHub `main` evaluation commit: `79c6775dbb05ea8ed8839f6d94758f51dbb47876`.
- Exact evaluated and published Git tree: `1362824217c0b19be3b2ae0e95e39b8af73f5624`.
- Vercel production deployment: `dpl_Dwqm15RKG33cRxh5vRRUPTy9Zs26`, state `READY`, target `production`, with Git metadata tied to the exact evaluation commit.
- The canonical `/institutional-credentials`, `/api/institutional-credentials-register.json`, `/api/evaluations/institutional-credentials.json`, `/api/assurance-manifest.json`, `/api/release-control-report.json`, `/program/promise-delivery/promise-release-registry.json`, and `/artifacts/interaction-audit/report.json` each returned HTTP 200.
- The rendered policy response contained the expected title, evidence-class boundary, navigation, six policy sections, and accountability record.
- Live evaluator evidence reported 13/13 checks, six records, 88/88 mapped claim occurrences, zero unmatched occurrences, zero ambiguous variants, and zero findings.
- The live assurance manifest reported seven of seven site-assurance domains `passed-limited`, zero certified domains, and zero errors.
- Live release and promise totals matched 262 governed resources and 5,368 records / 12,013 occurrences across 505 public surfaces, with 9,782 interactions and zero interaction failures.
- Vercel reported no runtime errors for the checked Unit 13 routes in the verification window.
- Browser-control tooling was not exposed in the publication session, so this verification does not claim an independent screenshot, browser-console capture, or visual-layout certification; the deployment, HTTP, response-content, live-data, and runtime-error boundaries above were directly checked.

## R07 closure decision

PASS within the stated boundary. The exact evaluated tree was published to GitHub `main`, deployed to Vercel production, and reproduced the expected live evidence and release totals. Unit 13 is closed. All thirteen R07 units now satisfy their documented bounded acceptance criteria, so R07 is formally closed. No R07 result is an independent certification of credentials, institutional standing, legal accuracy, security, privacy, accessibility, rights clearance, or any other excluded real-world condition.
