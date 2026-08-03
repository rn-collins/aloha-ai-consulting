# R09 Progress Report 01 — Exact Acquisition and Workspace Obligation Boundary

**Frozen audit baseline:** 4,289 grouped claims / 9,552 occurrences  
**Current reviewed estate:** 262 canonical resources / 505 public surfaces / 9,782 interactions / 5,368 promise records / 12,013 occurrences  
**Tranche:** R09 — Deferred acquisition artifacts and Workspace access model  
**Status:** locally implemented and fully verified; GitHub publication and production verification pending

## Purpose and boundary

This unit establishes R09's exact inherited denominator before any artifact is built or any Workspace capability is represented as available. It reconciles the frozen R01 occurrence manifest to six acquisition promises: five tool artifacts and the separately discovered IDR Engine product artifact. It also defines eight Workspace capability families whose availability requires complete production states.

A passing result proves exact obligation coverage and accurate current unavailability. It does not deliver an artifact, enable purchase or licensing, authenticate a user, persist data, implement permissions or collaboration, or certify a Workspace capability.

## Findings and remediation

- The R01 frozen manifest and report contain six unavailable acquisition occurrences.
- R08 handoffs repeatedly referred to five paid artifacts because they counted the five Trust Stack tool artifacts but omitted the R01-discovered IDR Engine product acquisition.
- Added a six-record acquisition register tied to the exact R01 promise IDs and canonical routes.
- Added a separate Workspace obligation covering authentication, persistence, permissions, collaboration, review, audit, monitoring, and personalization.
- Added explicit reconsideration triggers for acquisition and Workspace availability.
- Added a fail-closed evaluator to the release-blocking `builds:check` chain.
- Preserved every public no-checkout/no-purchase/no-license/no-download state and the Workspace no-access state.

## Decision

Unit 1 establishes the R09 control denominator. Artifact delivery and Workspace implementation remain open until later units meet the universal acceptance criteria.

## Local verification

- R09 obligation evaluator: 13/13 checks; six acquisition promises; five tool artifacts; one product artifact; eight Workspace capability families; zero findings.
- Repository tests: 105/105 passed.
- Generated HTML: 504/504 routes validated.
- Public surfaces and interactions: 505 surfaces and 9,782 interactions.
- Current promise registry: unchanged at 5,368 records / 12,013 occurrences.
- Immutable baseline: unchanged at 4,289 records / 9,552 occurrences.
- Full snapshot-hydrated `npm run site:ci`: passed.
