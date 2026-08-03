# R09 Progress Report 09 — Shared Commercial Infrastructure

**Frozen audit baseline:** 4,289 grouped claims / 9,552 occurrences

**Current reviewed estate:** 262 canonical resources / 505 public surfaces / 9,782 interactions / 5,368 promise records / 12,013 occurrences

**Tranche:** R09 — Deferred acquisition artifacts and Workspace access model

**Status:** infrastructure accepted locally; commerce remains closed; production publication pending

## Purpose and boundary

Unit 9 implements the shared commercial control plane required by the frozen Unit 2 architecture: catalog/readiness, server-authoritative Stripe Checkout, raw-body signed webhooks, immutable and idempotent order/event records, receipts, private signed fulfillment, redelivery, refund request and revocation behavior, support routing, and deny-by-default persistence.

This unit does not authorize a price, open checkout, grant a license, create Workspace access, or certify a production transaction. `COMMERCE_ENABLED` remains false and all six catalog entries remain unavailable.

## Material release finding

The six v2026.08.0 pre-release ZIPs and their source files are committed to the public Git repository. The evaluator records the exact six ZIP paths and SHA-256 hashes. Repository history cannot be converted into private signed fulfillment by adding a checkout layer later.

Therefore v2026.08.0 is evidence-only and ineligible to serve as the paid payload. Commercial release requires a fresh version built after the release terms are approved, stored only in private object storage, and matched to a new immutable manifest. Audit evidence may remain public; commercial payload bytes may not.

## Infrastructure implemented

- Eight serverless surfaces: catalog, readiness, checkout, signed webhook, receipt, private download, redelivery, and refund request.
- Stripe price IDs are selected from server configuration; clients cannot supply amounts or price IDs.
- Checkout requires a bounded idempotency key and marks Workspace entitlement false.
- Webhooks require Stripe signature verification against the raw body and deduplicate provider event IDs.
- Successful payment creates one exact-version order, one signed one-hour initial delivery grant, and a receipt containing the product, version, price, license scope, manifest checksum, and Workspace boundary.
- Private fulfillment reads from a private Vercel Blob path only after HMAC, expiry, order-state, delivery-record, and revocation checks.
- Redelivery returns a non-enumerating response, verifies order plus purchaser email, rate-limits grants, and issues a new one-hour token without creating another order.
- Stripe refund events move the order to refunded; the download gate rejects refunded orders.
- Refund requests create an auditable support event and do not promise an outcome.
- Supabase tables for orders, events, deliveries, and audit entries enable row-level security and expose no anonymous policies.
- No raw card data is requested or stored.

## Release blockers preserved

1. Exact prices are not approved.
2. Refund terms are not approved.
3. Support channel and response target are not approved.
4. Stripe, Supabase, Vercel Blob, Resend, and signing configuration is not production-verified.
5. Fresh private commercial payloads and their manifest hashes are not uploaded.
6. The ten clean-device production-proof tests have not passed.
7. Audit-Ready Operations still requires qualified Oregon legal/compliance review.
8. The public v2026.08.0 packages cannot be represented as secured paid downloads.

## Local verification

- R09 commerce-infrastructure evaluator: 23/23 checks; six products; eight API surfaces; four persistence tables; ten production-proof tests preserved; six publicly exposed pre-release ZIPs detected; zero control findings.
- Every commerce JavaScript file passed Node syntax validation.
- Repository tests: 105/105 passed.
- Generated HTML: 504/504 routes validated.
- Public surfaces and interactions: 505 surfaces and 9,782 interactions.
- Current promise registry: unchanged at 5,368 records / 12,013 occurrences.
- Immutable baseline: unchanged at 4,289 records / 9,552 occurrences.
- Full snapshot-hydrated `npm run site:ci`: passed.

## Decision

The shared commerce infrastructure is internally accepted in a fail-closed state. No product is commercially released, no public page changes to purchase language, and no Workspace entitlement exists. Unit 10 must resolve commercial terms, create fresh private payload versions, configure providers, apply the reviewed persistence migration, and execute all ten test-mode and production-proof scenarios before any individual product may be enabled.
