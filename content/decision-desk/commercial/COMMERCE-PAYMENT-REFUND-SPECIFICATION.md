# Payment, receipt, cancellation, and refund integration specification

Status: provider-neutral draft; no live checkout or credentials authorized  
Version: 0.1

## Checkout boundary

Checkout opens only for an accepted screen and a reserved inventory token with a short, published expiry. The pre-purchase page must display the exact offer/version, date/time/timezone, delivery method, capacity, total price, currency, taxes/fees, inclusions, exclusions, refund/cancellation/transfer rules, privacy notice, access route, and support route.

## Required records

Store provider transaction ID, internal order ID, participant ID, offer/session/version, amount/currency/tax, state, timestamps, receipt state, refund state/reason, and reconciliation status. Do not store card data, workflow descriptions, access needs, or optional marketing consent in payment metadata.

## Idempotent event handling

Every provider event must be authenticated, deduplicated, and safe to replay. Success requires server-side verification—not a browser redirect. Inventory, receipt, confirmation, and refund actions must use idempotency keys. Unknown or out-of-order events enter human review.

## Transaction states

initiated → pending → paid → reconciled  
pending → failed | expired  
paid → partially_refunded | refunded | disputed  
Any duplicate charge, technical error, post-payment decline, or organizer cancellation follows the approved full-refund path.

## Compensating actions

- paid but confirmation failed: hold seat, send approved manual notice, retry safely, log incident;
- paid but inventory unavailable: do not oversell; full refund and apology;
- accepted then later conflict/sensitivity decline: full refund;
- duplicate payment: refund duplicate;
- material organizer change: affirmative acceptance or full refund;
- processor outage: keep checkout closed; never collect payment details manually.

## Reconciliation

Daily while sales are open, reconcile orders, provider transactions, receipts, refunds, disputes, inventory, and accounting exports. Exceptions require an owner and resolution date. Test mode and production mode must be visibly distinct.

## Go-live evidence

Document successful synthetic/test-mode purchase, failed payment, abandoned checkout, duplicate webhook, delayed webhook, receipt failure, full refund, duplicate charge, organizer cancellation, dispute notification, and refund reconciliation. Provider, price, tax, refund timing, and credential owners remain unresolved until RN approval.
