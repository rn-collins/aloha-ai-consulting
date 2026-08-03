# R09 Progress Report 10 — Commercial Terms and Release Preparation

**Date:** 2026-08-03

**Status:** commercial terms approved and technically encoded; commerce remains closed

## Approved terms

| Product | Named-organization license price |
|---|---:|
| Five-Domain Knowledge Base | $1,250 |
| Neuroscience-of-Trust Content Architecture | $1,500 |
| Commercial-Launch APQ Gap Model | $2,000 |
| The IDR Engine | $1,750 |
| Audit-Ready Operations | $2,500 |
| Nervous-System-Aware Platform-Risk Intelligence | $1,750 |

The license covers one named legal organization and permits internal implementation, adaptation, training, and retention of the acquired immutable version. It prohibits resale, public source-file redistribution, removal of notices, and representation as professional or platform assurance. Artifact acquisition creates no Workspace entitlement.

Refund requests may be made within 14 calendar days only when no package download has been redeemed. Duplicate charges are remedied. Materially defective files are repaired, replaced, or refunded after verification. Nonwaivable statutory rights remain unaffected. Support uses a brand-owned Aloha AI email configured at release and targets an initial response within two business days.

## Controls added

- Six server-readable USD prices are now canonical and remain visible through the closed catalog.
- Checkout still uses server-configured Stripe Price IDs; the webhook additionally rejects any paid amount or currency that differs from the approved catalog.
- Receipts disclose the exact license, refund rule, support target, and lack of Workspace access.
- Successful downloads record redemption time so the no-download refund rule is auditable.
- Fresh commercial packages are frozen at target version `2026.08.1`; public `2026.08.0` evidence builds remain ineligible commercial payloads.

## Remaining release blockers

1. Configure and verify the actual brand-owned support email.
2. Create materially fresh `2026.08.1` commercial payloads and keep their bytes out of public Git history.
3. Upload each payload to private object storage and bind its path and manifest SHA-256 through production secrets.
4. Configure and verify Stripe, Supabase, Vercel Blob, Resend, and delivery-signing secrets.
5. Obtain qualified Oregon legal/compliance review before Audit-Ready Operations can be enabled.
6. Run every required test-mode and production purchase scenario on a clean device.
7. Enable products individually only after their complete evidence passes.

## Decision

Approval of business terms removes the price, refund-policy, and response-target decision blockers. It does not authorize fabricated provider credentials, a nonexistent support mailbox, simulated Oregon review, or a false purchase test. Commerce therefore remains closed and all six public product pages must continue to state that acquisition is unavailable.

## Publication and production verification

- GitHub `main` evaluated implementation commit: `d660944eb11d3e3c239f36a95b5b2cb30d1c5ab7`.
- Exact evaluated Git tree: `f7baf62b04a84028f0233a660814ae8098006996`.
- Vercel production deployment: `dpl_4GQGPmUZKD8mPyW6xi2UeigAB7Wz`, state `READY`, target `production`, tied to the exact evaluated commit.
- `/artifacts/r09-commercial-terms-evaluation.json` returned HTTP 200 and reported 19/19 checks, six products, six exact prices, five remaining global blockers, one product-specific blocker, and zero findings.
- `/api/commerce/catalog` returned HTTP 200 with `enabled: false`, `commercialState: closed`, six approved prices, the approved refund and support rules, and no Workspace entitlement.
- `/api/commerce/readiness` returned the intended HTTP 503 fail-closed response; provider configuration remained absent, five global blockers remained, and every product was unavailable.
- `/trust-stack/ai-content-system` returned HTTP 200 and remained `Description only · access unavailable` and `not currently for sale`.
- Vercel reported no runtime errors in the targeted verification window.

R09 Unit 10 closes the business-terms decision stage only. Private commercial builds, provider provisioning, Oregon review, and production purchase certification remain open release work.
