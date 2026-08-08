# End-to-end commercial journey QA matrix

Status: draft test protocol; no test claimed complete  
Version: 0.1

Use synthetic identities, test-mode payments, nonproduction calendars, and approved test inboxes only. A passing automated check is not proof of usability or legal compliance.

## Required scenarios

| ID | Scenario | Required outcome |
|---|---|---|
| CJ-01 | masterclass happy path | disclose → register → pay → confirm → calendar → reminders → attend → materials → close |
| CJ-02 | clinic happy path | disclose → register → human accept → pay → confirm → prepare → attend → bounded record → correction → close |
| CJ-03 | clinic decline before payment | neutral decline; no charge; minimum record |
| CJ-04 | clinic decline after payment | full refund; seat released; confirmation suppressed |
| CJ-05 | one-question clarification | bounded response; no sensitive-fact solicitation |
| CJ-06 | last-seat concurrency | one confirmation; no oversell; loser receives no charge or prompt refund |
| CJ-07 | payment failure/abandonment | no seat confirmation; safe retry/expiry |
| CJ-08 | duplicate/delayed webhook | one order, one receipt, one seat, no duplicate messages |
| CJ-09 | payment succeeds/email fails | seat held; manual notice; idempotent redelivery |
| CJ-10 | receipt/calendar failure | recovery without duplicate charge or disclosure |
| CJ-11 | accessibility request | private acknowledgment; no diagnosis required; deadline protected |
| CJ-12 | timezone/DST | identical instant across page, receipt, email, calendar, facilitator view |
| CJ-13 | cancellation before deadline | correct full refund and inventory release |
| CJ-14 | transfer | new participant screened; records and consents separated |
| CJ-15 | organizer cancellation/change | affirmative option; refund available; calendar/messages corrected |
| CJ-16 | platform/caption outage | rehearsed fallback or reschedule/refund |
| CJ-17 | sensitive disclosure | interruption; no reproduction; case safely substitutes/stops |
| CJ-18 | correction request | versioned response within service level |
| CJ-19 | optional consent withdrawal | marketing/quote/waitlist stops without affecting delivery |
| CJ-20 | privacy access/deletion request | authenticated, scoped, logged response |
| CJ-21 | refund/dispute reconciliation | processor, order, inventory, ledger agree |
| CJ-22 | advisory inquiry | separate scope; no engagement or data-sharing implication |
| CJ-23 | malicious/duplicate form input | safe validation, rate handling, no code/log injection |
| CJ-24 | mobile/keyboard/screen reader/zoom | complete journey usable in observed test scope |

## Evidence required per test

Record environment, build/commit, offer/form/policy versions, synthetic fixture, steps, expected/observed outcome, screenshots or logs with secrets removed, tester, date, defects, retest, and final disposition.

## Acceptance

- CJ-01 through CJ-24 executed;
- critical/high defects closed and retested;
- payment/refund/accounting reconciliation passes;
- no unresolved placeholder or unapproved claim;
- privacy/security, accessibility, terms, email-client, browser/mobile, support, masterclass, and clinic rehearsals dispositioned;
- production credentials and routes remain inactive until RN signs the activation record.

## Stop rules

Stop testing on live-charge risk, real-person data, exposed secret, oversell, misdirected message, inaccessible essential step, uncontained disclosure, or production mutation. Contain, document, remediate, and restart only under an approved test plan.
