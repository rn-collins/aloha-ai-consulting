# Scheduling, capacity, calendar, and delivery specification

Status: draft; calendars and booking inactive  
Version: 0.1

## Session record

Each session requires a stable ID, offer/version, date, start/end, IANA timezone, delivery method, capacity, reserved/confirmed/waitlist counts, registration close, cancellation deadlines, facilitator, support coverage, accessibility readiness, backup platform, and status.

## Inventory rules

- masterclass capacity is owner-approved before publication;
- clinic capacity is four maximum and may be reduced for access/privacy;
- reserved seats expire predictably;
- confirmed seats cannot exceed capacity;
- waitlist is opt-in and creates no charge;
- transfers require fit screening where applicable;
- staff/test seats are excluded from sellable inventory.

## Calendar behavior

Generate the participant's local display plus the canonical timezone. Calendar files and invitations must contain title, exact times, approved join instructions, support, cancellation route, and boundaries. Never include intake content, other participants, access needs, or payment data. Material changes require a new version and affirmative participant choice where promised.

## Delivery and fallback

Access links are unique where supported and are not published. Captions, keyboard access, dial-in/text alternative, material formats, and day-of support must match the accessible-delivery manifest. The backup platform must be rehearsed; otherwise reschedule or refund. Recording is prohibited for the initial release.

## State changes

draft → approved_for_testing → test_scheduled → test_passed → owner_approved → open  
open → full | registration_closed | postponed | cancelled | completed  
Only RN can authorize open. A session automatically stops accepting reservations at capacity or registration close.

## Required tests

DST/timezone rendering, reservation expiry, simultaneous last-seat attempts, oversell prevention, waitlist consent, transfer, calendar generation/update/cancel, broken access link, caption failure, platform outage, facilitator absence, organizer cancellation, and participant refund.
