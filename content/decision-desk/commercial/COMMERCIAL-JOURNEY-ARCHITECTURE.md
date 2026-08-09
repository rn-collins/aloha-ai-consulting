# Issue 01 commercial journey architecture

Status: draft operating architecture; inactive; not authorization to sell, schedule, enroll, or send  
Version: 0.1  
Owner: RN Collins / Aloha AI

## Purpose

This record connects the Decision Desk article, 90-minute masterclass, bounded clinic, and optional advisory inquiry without collapsing them into one offer or implying a subscription. It defines the participant path and the evidence required to move between states.

## Offer roles

| Offer | Participant purpose | Included | Not included | Commercial status |
|---|---|---|---|---|
| Decision Desk Issue 01 | Understand one evidence-backed AI-use decision | article, Source Desk, decision instrument | individualized advice, product approval, live-data authorization | editorial release pending |
| Masterclass | Learn and practice the method with fictional data | free 60-minute session, teaching package, follow-up resources | individualized case analysis, CLE, certification, legal advice | registration inactive |
| Bounded clinic | Apply the method to one nonconfidential workflow | US$295 two-hour group clinic, participant-built decision and implementation record, one correction cycle | implementation, procurement, product testing, legal opinion | booking inactive |
| Private Decision Review | Apply privately to one decision | US$750, 90-minute collaborative review and private record | legal advice, implementation, product testing | booking inactive |
| Private Team Decision Lab | Align holders of one organizational decision | US$2,800 customized team process for up to four screened colleagues | guaranteed consensus, implementation, legal opinion | booking inactive |
| Advisory inquiry | Explore separately scoped organizational work | fit conversation only | engagement, data sharing, or advice before written scope | inquiry path pending |

No purchase creates a recurring subscription. No participant must buy the clinic or advisory work to complete the masterclass.

## Canonical journey

discover → understand → compare offers → check fit → select session → register → masterclass eligibility validation or clinic human screen → pay → confirm → prepare → attend → receive materials → correct/clarify → close → optionally inquire

Every transition requires a durable event ID, timestamp, offer/version, actor, outcome, and failure reason. Sensitive narrative must never be copied into payment, analytics, calendar, or email metadata.

## Participant-work rule

All applied offers follow the participatory standard. Public copy, intake, preparation, delivery, follow-up, and measurement must make the participant labor—private input, actual-work mapping, dissent, evidence separation, ownership, if–then actions, stop authority, and review—explicit.

## Activation prerequisites

Before a live offer exists, RN must approve: title, promise, price, currency, taxes/fees treatment, date, start/end time, timezone, platform/location, capacity, registration close, refund deadlines, support owner, accessibility owner, privacy owner, retention periods, payment provider, scheduler, sending domain, and exact participant materials.

## Separation rules

- Screening and participation acknowledgments are required; marketing, quotation, and waitlist permissions are optional and default off.
- Accessibility requests use a private channel and do not require diagnosis.
- Payment tokens remain with the processor; Aloha AI stores only necessary transaction references.
- Calendar descriptions contain logistics and boundaries, not intake details.
- Advisory inquiry is a new scope decision, not an automatic upsell.
- Analytics may record aggregate state counts but not workflow descriptions or access needs.

## Release boundary

All surfaces and integrations remain inactive until the end-to-end test matrix passes, critical/high defects close, and RN explicitly authorizes activation.
