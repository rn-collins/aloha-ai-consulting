# R08 Progress Report 04 — Legacy Satellite-System Evidence Boundary

Date: 2026-08-02

Status: passed locally within the three-record legacy satellite-system boundary; publication and production verification pending; R08 remains open

Frozen audit baseline: 4,289 promise records / 9,552 occurrences; unchanged

## Unit boundary

This unit governs three satellite-system references retained in the checked-in `patch-github-pages.js` migration utility: Platform Suppression Monitor, DEA Scheduling Monitor, and AI Governance Tracker. It distinguishes a historical checked-in name or hostname from current project evidence, current deployment evidence, public access, automation, monitoring, maintenance, data freshness, production readiness, and fitness for reliance. It also governs whether the utility may mutate Git state or publish without review.

It does not establish that a historical hostname is currently reachable or unreachable; inventory every repository, Vercel account, alias, or third-party deployment; certify that a historical system never existed; remove or modify the separately governed Aloha AI monitor records; or publish private project information.

## Defects found

- The legacy utility retained categorical claims that three satellite systems were live, automated, deployed infrastructure, and not prototypes.
- The connected Vercel project listing did not contain an unambiguous current project match for any of the three historical hostnames. That evidence gap did not support the operating claims.
- The utility inserted public links without a separately governed current destination determination.
- The utility automatically staged, committed, and pushed any files it changed, bypassing the current release-review controls.

## Remediation completed

- Added a versioned three-record satellite-system evidence register.
- Added a fail-closed evaluator for exact coverage, evidence, project/deployment boundaries, destination authorization, operating-claim authorization, prohibited stale language, and self-publishing behavior.
- Added the evaluator to the complete Builds/release CI path.
- Removed the legacy live-automation, deployed-infrastructure, production-readiness, and automated-intelligence assertions from the migration utility.
- Prevented the utility from inserting the three unverified public destinations.
- Removed automatic Git staging, commit, and push behavior; the utility now requires human diff review and the ordinary release workflow.

## Local evidence

- Satellite-system evaluator: 10/10 checks passed.
- Governed historical records: 3.
- Confirmed current Vercel project mappings: 0.
- Confirmed current deployments: 0.
- Public destinations authorized by this register: 0.
- Operating claims authorized by this register: 0.
- Evaluator findings: 0.
- Repository tests: 105/105 passed.
- Canonical resources: 262.
- Sitemap routes: 504; public surfaces including recovery: 505.
- Generated HTML files validated: 504.
- Interactions: 9,782; all destination and state contracts resolved.
- Shared represented actions: 94; all governed by the shared runtime.
- Current promise registry: 5,368 records / 12,013 occurrences, exactly reconciled.
- Immutable baseline: 4,289 records / 9,552 occurrences, unchanged.

## Production verification

Pending GitHub publication and exact-tree Vercel verification.

## Remaining R08 work

- Inventory other publicly represented repositories, deployments, downloads, prototypes, engagements, and private systems outside this bounded legacy utility.
- Continue artifact-depth and destination work in dependency order.

## Decision

PASS locally within the stated three-record boundary. Unit 4 remains publication-pending. R08 remains open for the wider represented-asset and destination inventory.
