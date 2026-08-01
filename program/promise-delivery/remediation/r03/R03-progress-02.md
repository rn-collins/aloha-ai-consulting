# R03 Progress 02 — Retention, Attribution, and Booking Handoff

Date: 2026-07-31  
Branch: `remediation/promise-delivery-r01-r02`  
Status: Unit complete locally; R03 remains open  
Production action: none

## Outcome

R03 Unit 2 makes local conversion attribution, scoping-record retention, and the current external booking handoff explicit and fail-closed. It does not create or represent a receiving channel that the repository and environment cannot prove.

## Implemented

- Source route, canonical offer ID, and inquiry type are the only conversion-attribution fields retained in browser session storage.
- The attribution record expires after thirty minutes, disappears with the browser session, and can be cleared by the visitor.
- Scoping answers remain memory-only; they are not written to session storage, local storage, cookies, analytics, or a server.
- A namespaced browser event exposes only the three allowlisted attribution fields plus event and expiry timestamps. No intake answer is included.
- The full scoping record remains available for deliberate copy or JSON download.
- A separate booking-safe summary contains only offer, inquiry type, source route, requested next step, and timing.
- Opening Microsoft Bookings explicitly states that no scoping record is attached or submitted.
- The page discloses that the current Microsoft Bookings destination is associated with a Northeastern account.
- The privacy policy now describes the actual browser-local attribution, retention, clearing, scoping-record, booking, and inactive-receiving-channel behavior.
- Contact copy no longer promises that a note is reviewed unless the visitor deliberately places it in the external booking form.

## Fail-closed boundary

The site still has no Aloha AI-owned receiving endpoint or brand-owned email identity. Unit 2 therefore does not send the full record, create an internal inquiry record, issue a receipt, promise a response time, reserve capacity, or assert that the visitor's context reached RN. The booking provider remains a separate external destination.

## Validation

- Tests: 90/90 passed.
- Release controls: 157 objects, 4,289 frozen claims, and 287 site-system contracts passed.
- Canonical graph: 157 resources and 469 relationships validated.
- Generated HTML: 397 files validated.
- Whole-site structural audit: 397/397 routes found; zero critical failures.
- Interaction audit: 398 pages, 7,816 elements, and 1,252 unique destinations; zero failures.
- Presentation-system audit: passed.
- JavaScript syntax check: passed.
- Immutable audit baseline retained: 4,289 grouped records / 9,552 occurrences.
- Post-Unit-2 comparison inventory: 4,354 grouped records / 9,561 occurrences / 7,816 interactions. The comparison did not replace frozen control files.

## R03 open gates

1. Provision a brand-owned Aloha AI email identity and receiving endpoint.
2. Define and implement server-side authentication, spam/abuse protection, request validation, encryption, internal access, retention, correction, deletion, incident handling, and audit records.
3. Deliver the scoping record into the approved internal system.
4. Send a visitor receipt from the brand-owned identity with an accurate response expectation.
5. Replace or formally approve the Northeastern-associated booking account for commercial use.
6. Pass approved non-sensitive context into the final scheduling system or preserve the explicit manual handoff.
7. Connect allowlisted conversion events to an approved analytics destination, if desired; no sensitive content may enter analytics.
8. Complete keyboard/mobile rendered verification and authorized production verification.

No commit, push, deployment, or production certification was performed.
