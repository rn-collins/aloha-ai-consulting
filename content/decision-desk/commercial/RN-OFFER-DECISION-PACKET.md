# Issue 01 — RN offer decision packet

Status: recommended operating defaults; inactive; RN approval required before implementation or public display  
Version: 1.0  
Prepared: 2026-08-08  
Owner: RN Collins / Aloha AI

## Decision requested

Approve, revise, or decline the recommended first-release operating model below. This record does not open registration, collect data, charge anyone, reserve a seat, schedule an event, send a message, or authorize release.

## Executive recommendation

Launch one free, deliberately small live masterclass in week 1, followed by the same screened US$295-per-participant clinic in every remaining week of the month. A four-week month has three clinic cohorts; a five-week month has four. Keep the Decision Desk article and Source Desk free. Use the masterclass to teach the method with fictional material; use each clinic cohort only for participants whose one nonconfidential workflow passes human screening.

| Decision | Recommended default | Acceptable alternative | Why |
|---|---|---|---|
| Free editorial title | **Decision Desk 01: Before You Automate Intake** | **The Intake Decision Desk** | Names the decision and avoids a product-endorsement or legal-clearance claim. |
| Masterclass title | **Before You Use AI for Client Intake** | **Decision Desk Live: AI-Assisted Intake** | Outcome-led, specific, and distinct from a webinar, CLE, certification, or generic AI course. |
| Clinic title | **Improve Your Client Intake Workflow** | **AI Opportunity Clinic: Intake Edition** | Connects the clinic to the governed method and states its bounded output. |
| Masterclass price | **Free (US$0)** | No paid tier for the monthly masterclass | The masterclass is the free week-1 teaching and audience-development layer. It uses fictional material and does not include individualized workflow application. |
| Masterclass capacity | **12 paid participants** | 8 for a higher-touch pilot; never more than 16 without a second facilitator or revised exercises | Twelve supports individual work and debrief without creating a delivery or accessibility burden that has not been rehearsed. |
| Clinic price | **US$295 per person, per cohort** | Any variation requires explicit RN approval | Each remaining week carries the same screened clinic for a separate cohort. At four seats, one full cohort yields US$1,180 gross. |
| Clinic capacity | **4 screened participants maximum** | Reduce to 3 for access, sensitivity, or workload; do not expand for the first release | Matches the operating specification and gives each participant roughly 25–30 minutes of focused facilitated work. |
| Currency and fees | **USD; listed price includes ordinary platform/processor fees; applicable sales tax added only where legally required** | Tax-inclusive price after tax advice and nexus configuration | Clearer than passing variable processing fees to participants. Tax collection must remain off until configured and reviewed. |
| Masterclass date | **Thursday, September 24, 2026, 10:00–11:30 a.m. HST** | Tuesday, September 29 at the same time | 10:00 a.m. HST is 4:00 p.m. Eastern while U.S. daylight saving time is in effect, enabling Hawaiʻi and mainland participation. |
| Clinic dates | **Every remaining week of the month; exact dates/times pending** | Three cohorts in a four-week month; four in a five-week month | Each cohort uses the same governed clinic scope and separate operational records. |
| Delivery | **Zoom Workplace paid meeting, recording disabled, automated captions enabled and rehearsed** | Google Meet only after equivalent caption, keyboard, dial-in, host-control, and fallback tests pass | Familiar access and appropriate duration; platform selection does not replace observed accessibility testing. |
| Backup delivery | **A separately rehearsed Zoom meeting plus dial-in and complete materials-first fallback** | Reschedule/refund if the primary and rehearsed backup fail | No untested emergency platform and no public join link. |
| Payment | **Stripe-hosted Checkout after acceptance; server-verified payment; no card data stored by Aloha AI** | Stripe Payment Links only if capacity, screening, idempotency, refunds, and confirmation can still be enforced server-side | The existing state model requires payment to occur after fit acceptance and before confirmation. |
| Registration and screening | **First-party Aloha AI forms and state machine; human clinic decision by RN** | Tally or Fillout only after data-processing, retention, accessibility, webhook, export/deletion, and sensitive-field review | Preserves the project’s governed states and prevents clinic narrative from leaking into payment, calendar, or analytics metadata. |
| Email | **Resend transactional email from a verified Aloha AI domain; marketing consent separate and off by default** | Manual transactional delivery for the pilot if every send is logged, reconciled, and privacy-safe | The repository already contains Resend-aware architecture; production sending still requires domain, suppression, bounce, retry, and failure testing. |
| Scheduling | **Fixed session inventory on the Aloha AI site; calendar invitation only after confirmation** | Cal.com only after capacity, screening, privacy, timezone, cancellation, and webhook tests | Fixed cohorts do not need open-ended appointment scheduling. |
| Recording | **No recording, transcript retention, or AI meeting assistant for the first release** | None for release one | Consistent with current participant and clinic records and reduces privacy and consent complexity. |

## Financial model

These are planning figures, not revenue promises.

| Offer | Seats | Price | Gross | Illustrative Stripe domestic-card fee at 2.9% + US$0.30 | Approximate net before taxes, labor, refunds, and other costs |
|---|---:|---:|---:|---:|---:|
| Free masterclass | 12 | US$0 | US$0 | US$0 | US$0 |
| One public clinic cohort | 4 | US$295 | US$1,180 | US$35.42 | US$1,144.58 |
| Four-week month clinic total | 12 across 3 cohorts | US$295 | US$3,540 | US$106.26 | US$3,433.74 |
| Five-week month clinic total | 16 across 4 cohorts | US$295 | US$4,720 | US$141.68 | US$4,578.32 |
| Combined first release | 16 purchases | — | **US$6,540** | **US$194.52** | **US$6,345.48** |

The clinic price is RN’s owner-directed planning price, not a claim of validated willingness to pay. The masterclass is free. The fee illustrations use the previously recorded Stripe domestic-card assumption of 2.9% + US$0.30 per successful transaction; re-verify provider pricing at activation.

The masterclass is free. If clinic access requires flexibility, RN may approve a bounded scholarship or reduced-price clinic seat without exposing recipients or implying a permanent discount.

## Registration and deadline defaults

### Masterclass

- Registration opens only after all release gates pass and RN authorizes activation.
- Registration closes Monday, September 21, 2026 at 10:00 a.m. HST, or when 12 paid seats are confirmed.
- Full refund through Thursday, September 17, 2026 at 10:00 a.m. HST.
- After that deadline, one screened transfer or one future-session credit may be offered through Tuesday, September 22 at 10:00 a.m. HST.
- No automatic refund for a late cancellation or no-show, except an access failure attributable to the organizer, an RN-approved emergency exception, or applicable law.
- Organizer cancellation or a material organizer change: full refund or affirmative acceptance of the alternative.
- Minimum viable cohort: 5 paid participants. RN may still deliver below five; if RN cancels for low enrollment, participants receive a full refund and optional priority for a later date.

### Clinic

- A participant submits the minimal fit screen before any payment link appears.
- Fit screen closes Monday, September 28, 2026 at 10:00 a.m. HST or earlier when the review queue can no longer produce four supported acceptances.
- RN responds to a complete fit screen within two business days, no later than Wednesday, September 30 for an on-time submission.
- An acceptance-linked checkout hold expires after 48 hours and no later than Friday, October 2 at 10:00 a.m. HST for this pilot.
- Full refund through Saturday, October 3, 2026 at 10:00 a.m. HST. Checkout must display the participant's exact deadline before payment; no participant may receive less than 24 hours after confirmed payment to cancel for a full refund.
- A screened transfer may be requested through Monday, October 5 at 10:00 a.m. HST; transfer is never automatic.
- Decline after payment, organizer cancellation, material organizer change, duplicate charge, or organizer-caused access failure: full refund.
- Minimum viable clinic: 2 paid participants. RN may convert a single accepted participant to a private 75-minute session only with affirmative agreement and no scope reduction, or provide a full refund.

## Service levels and owners

For the first release, RN should retain substantive authority while operational tasks remain explicitly assigned.

| Function | Accountable owner | Operating role | Initial service level |
|---|---|---|---|
| Offer and release approval | RN | final decision-maker | explicit recorded approval required |
| Facilitation and clinic screening | RN | facilitator and human screener | complete screens answered within 2 business days |
| Privacy | RN until a named delegate is trained | approves fields, processors, retention, incidents, and data-subject requests | acknowledge privacy request within 2 business days |
| Accessibility | RN until a named delegate is trained | private access-request response and alternative-format coordination | acknowledge within 1 business day; agree plan before refund deadline |
| Participant support | Named shared inbox monitored by RN for pilot | logistics, access, payment/refund triage | 1 business day normally; 2 hours during the session-day support window |
| Refund authority | RN | approves exceptions and all nonautomatic dispositions | initiate approved refund within 2 business days |
| Technical operations | Named implementation owner before testing | state machine, webhooks, email, calendar, reconciliation, rollback | staffed during sales window and live session |
| Day-of backup | Named person other than facilitator | support monitoring and contingency execution | online 30 minutes before through 30 minutes after |

RN should not facilitate and simultaneously serve as the only day-of technical/accessibility support person. If no second person is named, reduce the masterclass to eight and the clinic to three, and use a materials-first fallback.

## Recommended retention schedule

The schedule minimizes data while preserving transaction, correction, and incident evidence. It remains subject to tax, accounting, insurance, contract, and applicable-law review before activation.

| Record | Recommended retention | Disposition |
|---|---|---|
| Abandoned, incomplete, or expired browser/session state | 24 hours maximum; no narrative | automatic deletion |
| Rejected clinic description and screen | 30 days after the decline, refund, and any timely screening-question closure | delete narrative; retain only minimal aggregate outcome if needed |
| Accepted clinic intake description | 90 days after delivery and correction close | delete narrative; retain final participant-supplied deliverable only if affirmatively requested |
| Accessibility-request details | 30 days after session or final resolution | delete details; retain nonidentifying improvement finding where useful |
| Participant roster and operational messages | 24 months after session | delete or de-identify unless an unresolved dispute or obligation applies |
| Feedback with identifiers | 12 months | de-identify earlier when feasible; optional quotation permission stored separately |
| Terms/consent/version acceptance evidence | 24 months after session | delete unless dispute, chargeback, or legal obligation extends the hold |
| Payment processor IDs, invoices, refunds, and accounting records | 7 years | restrict access; retain no card data or workflow narrative |
| Security, privacy, payment, or access incident record | 7 years from closure, or longer only on documented legal/insurance advice | segregate and restrict |
| Marketing contact | Until opt-out or 24 months of inactivity, whichever comes first | suppress immediately on opt-out; do not treat suppression record as marketing permission |
| Recording/transcript/AI meeting output | None | recording and meeting assistants prohibited |

Any legal hold, dispute, chargeback, or incident pauses deletion only for the affected record class and must be documented.

## Provider configuration recommendation

1. Use the site’s first-party registration, screening, inventory, and state machine.
2. Use Stripe Checkout for accepted participants; keep tax collection disabled until a tax decision is made.
3. Use Resend solely for transactional messages from a verified domain. Do not use the retired `new.email` product or enable marketing automation as part of launch.
4. Use fixed session records rather than a public scheduler.
5. Use Zoom Workplace with recording, cloud transcript, AI Companion meeting summary, and third-party bots disabled.
6. Generate an ICS attachment and private join instructions only after confirmation.
7. Keep sensitive clinic narrative in the screened intake record only; never copy it into Stripe, Resend, Zoom, calendar, analytics, logs, or support subject lines.
8. Maintain a manual reconciliation export and rollback path for the pilot even if automation passes.

## RN approval card

RN can approve the complete recommendation with one statement:

> I approve Issue 01 offer decision packet v1.0 as the operating target for test-mode implementation. This approval does not authorize public registration, payment, sending, booking, merge, or release.

Or revise only the consequential fields below:

| Field | Recommended | RN decision |
|---|---|---|
| Masterclass title | Before You Use AI for Client Intake | pending |
| Masterclass price/capacity | US$0 / 12 | owner-directed planning decision; activation pending |
| Masterclass date/time | week 1; exact date/time pending | pending |
| Clinic title | Improve Your Client Intake Workflow | pending |
| Clinic price/capacity | US$295 per participant / 4 | owner-directed planning decision; activation pending |
| Clinic dates/times | every remaining week; exact dates/times pending | pending |
| Delivery | Zoom Workplace; no recording | pending |
| Payment | Stripe Checkout after acceptance | pending |
| Registration/state | first-party Aloha AI implementation | pending |
| Transactional email | Resend / verified Aloha AI domain | pending |
| Retention | schedule in this packet | pending |
| Accountable owner | RN | pending |
| Day-of support owner | must be named before rehearsal | pending |
| Technical operations owner | must be named before testing | pending |

## Implementation boundary

Approval of this packet authorizes only test-mode implementation if RN says so explicitly. Public display of prices/dates, real data collection, production credentials, payment, booking, email, calendar creation, participant acceptance, merge, and release remain separately gated by the 24-scenario commercial QA matrix, rehearsals, observed accessibility/responsive testing, required legal/privacy/tax dispositions, and RN’s final release approval.
