# Clinic commercial, delivery, and support rules

Version: MCC-COMM-1.0
Status: provider-neutral specification; no price, date, or provider approved

## Capacity and confirmation

Capacity is four unless RN approves another tested staffing model. A seat exists only after human acceptance, successful payment, available capacity, and delivered confirmation. A screening invitation or checkout session is not a seat.

## Before payment

Display title, outcome, exclusions, no-recording rule, duration, timezone, delivery method, facilitator, capacity, price, taxes/fees, refund/cancellation terms, privacy, accessibility request path, support contact, and exact data boundary.

## Timing

Use a fixed session, not public scheduling, for the first cohort. Screen before payment. Checkout must expire. Preserve at least 24 hours of full-refund eligibility after payment. Do not expose participant or workflow facts in receipts, calendar titles, metadata, or email subject lines.

## Cancellation and refund

Organizer cancellation, platform capture failure, duplicate charge, post-payment decline, oversell, or inability to deliver the stated accessible path receives full refund. Participant cancellation deadlines and transfer rules require RN approval and must be visible before payment. No-show handling cannot imply delivery of the individualized record.

## Delivery controls

Named facilitator and day-of support operator; verified recording/AI features off; waiting room; authenticated host; controlled screen share; private support route; accessible materials; fallback platform; incident contacts; attendance reconciliation; and post-session delivery verification.

## Support levels

Critical safety/privacy/access incident: acknowledge immediately during session. Access failure before session: prompt human response under approved service level. Ordinary correction/support: bounded business-day response. Do not advertise times until staffing supports them.

## Reconciliation

Order, payment, capacity, confirmation, attendance, refund, deliverable, correction, and closure states reconcile by stable IDs. Webhook/event handling must be idempotent. Failures route to human review; no silent double charge, duplicate seat, or contradictory message.

## Inactive boundary

No checkout, form action, email send, calendar event, seat, or provider credential is activated by this record.
