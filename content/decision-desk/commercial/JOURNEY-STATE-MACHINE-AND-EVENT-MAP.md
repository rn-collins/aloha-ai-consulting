# Commercial journey state machine and event map

Status: draft canonical workflow; integrations inactive  
Version: 0.1

## Participant-level states

| State | Entry evidence | Allowed next states | Required action |
|---|---|---|---|
| discovered | anonymous visit | informed | no personal data required |
| informed | disclosures viewed | registering, closed | preserve offer version |
| registering | form started | submitted, abandoned | minimize and expire draft data |
| submitted | valid form | eligibility_check, screening, declined | issue submission acknowledgment |
| eligibility_check | masterclass rules and capacity validation | accepted, declined, closed | no individualized merits review; do not imply a seat |
| screening | clinic human review assigned | clarify, accepted, deferred, declined | never imply acceptance |
| clarify | one bounded question | screening, withdrawn | do not solicit sensitive facts |
| accepted | screen passed and inventory available | payment_pending, expired | create reserved inventory token |
| payment_pending | provider session created | paid, failed, expired | verify server-side |
| paid_unconfirmed | verified payment | confirmed, refund_pending, support_hold | hold seat; deliver receipt/confirmation |
| confirmed | payment, capacity, and confirmation succeeded | preparing, cancelled, transferred | deliver calendar/materials |
| preparing | session approaching | attended, no_show, cancelled | reminders follow preferences |
| attended | attendance recorded | materials_sent, correction_open | no certificate/CLE claim |
| materials_sent | package delivered | correction_open, closed | versioned delivery evidence |
| correction_open | timely request | revised, closed | one included clarification/correction cycle |
| closed | obligations complete | advisory_inquiry | optional, non-pressured |
| advisory_inquiry | separate affirmative request | scoped_elsewhere, closed | no sensitive facts or engagement implied |

Terminal/exception states: declined, deferred, withdrawn, failed, expired, cancelled, no_show, refund_pending, refunded, disputed, incident_hold.

## Invariants

1. No confirmed seat without masterclass eligibility validation or clinic human-screen acceptance, verified payment, capacity, and delivered confirmation.
2. No attendance link before confirmation.
3. No sensitive narrative in payment, email, calendar, analytics, or event payloads.
4. No optional consent blocks required participation.
5. No automatic decline on protected/accessibility information.
6. No oversell; inventory conflicts resolve to refund, not an extra seat.
7. No advisory marketing without separate opt-in or participant inquiry.
8. Every refund and material change reaches a terminal reconciled state.

## Event envelope

Each event records: event ID, occurred/received time, source, participant pseudonymous ID, order/session/offer IDs where needed, prior/new state, policy/form versions, actor, idempotency key, result, and non-sensitive failure code. Logs must exclude free text, access details, secrets, tokens, payment data, and intake descriptions.

## Failure recovery

Events can be replayed without duplicating email, calendar, seat, receipt, or refund. Poison events quarantine for human review. Support can place an incident hold that stops automated messages and changes while preserving the seat/payment disposition.

## Deletion and export

Deletion removes or de-identifies operational records according to the approved schedule while preserving only required transaction/dispute evidence. Participant export must exclude internal risk notes, other participants, secrets, and processor-only data.
