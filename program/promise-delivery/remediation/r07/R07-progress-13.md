# R07 progress 13 — Institutional Credentials

Date: 2026-08-02

Status: passed within the documented selected-public-claim inventory, evidence-class disclosure, and exact-claim mapping boundary in the fully hydrated local release tree; Unit 13 implementation complete; exact-tree GitHub publication and production verification pending; R07 is eligible to close only after that publication verification succeeds

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

Pending. No evaluation commit, exact-tree GitHub tree, Vercel deployment ID, production state, or live HTTP verification is recorded until the publication workflow succeeds.

The required live checks are:

- exact evaluation commit and tree match;
- production deployment state `READY`, target `production`, tied to the exact evaluation commit;
- HTTP 200 for `/institutional-credentials`, `/api/institutional-credentials-register.json`, `/api/evaluations/institutional-credentials.json`, and `/api/assurance-manifest.json`;
- live evaluator evidence reporting 13/13 checks, six records, 88 mapped claim occurrences, and zero findings;
- live assurance manifest reporting seven bounded site domains, zero certified domains, and no failed-closed domain;
- live release and promise totals matching 262 governed resources and 5,368 records / 12,013 occurrences across 505 public surfaces.

## R07 closure decision

The local release tree satisfies the bounded acceptance criteria for all thirteen R07 units. R07 may close after exact-tree publication and production verification confirm the same evidence. Until then, Unit 13 implementation is complete but R07 remains administratively open.
