# R09 progress 06 — IDR Engine artifact build

Status: production-closed

R09 Unit 6 builds the fourth acquisition package, The IDR Engine v2026.08.0, against the Unit 2 delivery architecture. The package remains unavailable for checkout, purchase, license, download, or Workspace entitlement.

## Package boundary

The IDR Engine is a dated research-record and human-review system. It is not legal advice, a continuously connected regulatory feed, or an assurance that a claim is current, binding, complete, or suitable for consequential use. Every consequential claim requires current primary-source verification by a qualified human.

## Acceptance target

- Nine architecture contents
- Claim-level JSON Schema and filled records
- Authority and claim ledgers
- Fabricated, nonbinding, superseded, and jurisdictionally irrelevant adversarial fixtures
- Mata and Wadsworth failure analyses
- Federal Register, eCFR, and GovInfo maintenance procedure
- Human verification and change-watch gates
- PDF, DOCX, JSON, CSV, Markdown, and ZIP formats
- Five universal artifact tests accepted; commerce/fulfillment tests 5–7 deferred

## Local acceptance evidence

- IDR evaluator: 17/17 controls; 19 checksum-backed files; zero findings
- Five authority records, two filled claim records, and four adversarial fixtures
- 105/105 repository tests passed
- 504 HTML routes and 505 public surfaces validated
- 9,782 interactions validated
- Promise registry unchanged at 5,368 records / 12,013 occurrences
- Acquisition and Workspace entitlement remain unavailable

## Production evidence

- Evaluated implementation: `0fc000da73a7b474470d4729b0f82b1e058497a6`
- Evaluated tree: `6355d832bfd0fe647ea182ae3d4d8a5c6118ac0a`
- Production deployment: `dpl_GMoK8g75N9HwF6qMKGEuBWYVEQgP` (`READY`, production)
- Live evaluator and register returned HTTP 200 and exact governed counts
- Live product page preserved `Description only · access unavailable` and the not-for-sale boundary
- Release controls preserved 262 objects, 4,289 current claims, 287 exception contracts, and zero errors
- Vercel reported no runtime errors in the targeted production window

R09 Unit 6 is production-closed. Commerce and fulfillment remain deferred; Unit 7 should build the Cannabis OS package.
