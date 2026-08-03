# R09 Progress Report 02 — Artifact Delivery and Workspace Access Architecture

**Frozen audit baseline:** 4,289 grouped claims / 9,552 occurrences  
**Current reviewed estate:** 262 canonical resources / 505 public surfaces / 9,782 interactions / 5,368 promise records / 12,013 occurrences  
**Tranche:** R09 — Deferred acquisition artifacts and Workspace access model  
**Status:** passed locally; publication and production verification pending

## Purpose and boundary

This unit defines the complete delivery architecture that each of R09's six acquisition artifacts must satisfy before its unavailable state can change. It also separates downloadable artifact entitlements from the provisioned Workspace access model.

A passing result proves that the build queue has exact, artifact-specific delivery contracts and universal version, license, acquisition, fulfillment, maintenance, support, security, privacy, and acceptance requirements. It does not mean that any promised file exists, any artifact is purchasable or downloadable, any purchaser is licensed, or any Workspace capability is operational.

## Architecture established

- Six distinct package contracts preserve the exact Unit 1 artifact names and obligation IDs.
- Every package has named contents, required formats, and four artifact-specific acceptance tests.
- A shared calendar-version policy prohibits silent replacement and requires an immutable checksum-backed manifest.
- The default license architecture defines named-organization internal use, scope and attribution terms, professional boundaries, refund terms, privacy, rights, and prohibited resale or public source-file redistribution.
- Acquisition architecture governs unavailable through superseded states, required buyer surfaces, payment and fulfillment idempotency, signed downloads, redelivery, refunds, support, error recovery, and production proof.
- Maintenance architecture distinguishes maintained, frozen, superseded, and withdrawn versions and requires source cutoffs, update entitlement, urgent corrections, and purchaser notice.
- Eight universal artifact acceptance tests apply in addition to each package's specific tests.
- Workspace remains a separately provisioned access model across eight capability families, nine UI/authorization states, and twelve release tests; purchasing an artifact creates no Workspace account or entitlement.
- The build sequence requires individual artifact acceptance and prohibits batch promotion.

## Decision

Unit 2 establishes the release architecture. All six artifact acquisition states and all Workspace access states remain unavailable. Unit 3 may begin building the first complete artifact package against this contract.

## Local verification

- R09 delivery-architecture evaluator: 15/15 checks; six artifacts; 24 artifact-specific acceptance tests; eight universal artifact tests; twelve Workspace release tests; zero findings.
- Repository tests: 105/105 passed.
- Generated HTML: 504/504 routes validated.
- Public surfaces and interactions: 505 surfaces and 9,782 interactions.
- Current promise registry: unchanged at 5,368 records / 12,013 occurrences.
- Immutable baseline: unchanged at 4,289 records / 9,552 occurrences.
- Full snapshot-hydrated `npm run site:ci`: passed.

## Publication and production verification

- Pending.
