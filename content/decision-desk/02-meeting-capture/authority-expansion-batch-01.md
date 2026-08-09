# Issue 02 authority expansion — batch 01

Status: governed research tranche; draft branch only  
Verified on: 2026-08-08  
Scope: Alabama, Alaska, Arizona, and Arkansas recording/interception layer only  
Release effect: none. No jurisdiction packet is cleared. No human recording or product test is authorized.

## Batch result

| Jurisdiction | Result | Why |
|---|---|---|
| Alabama | primary-text retrieval open | The current official Code portal resolves §§ 13A-11-30, -31, and -35, but the statutory body was not exposed through the research interface. Secondary current-code reproductions indicate a private-communication/one-participant-consent structure and Class A misdemeanor offense. This is not enough to close the row under MCAP-1.0. |
| Alaska | primary-text retrieval open | Current-code reproductions identify AS 42.20.310 and .320, but the official Legislature results available in this pass were bill text rather than a current consolidated statute page. The row remains unverified. |
| Arizona | **recording layer verified** | Current official Arizona Revised Statutes §§ 13-3001, 13-3005, and 13-3012 were retrieved and reconciled. The result is bounded below. |
| Arkansas | primary-text retrieval open | The official Legislature provides the Arkansas Law portal and enacted Act 1773 of 2001. A current-code reproduction identifies Ark. Code § 5-60-120, but current consolidated official section text was not retrieved. The row remains unverified. |

## Arizona — verified recording layer

### Controlling current text

1. Arizona Revised Statutes § 13-3001, definitions:  
   https://www.azleg.gov/ars/13/03001.htm
2. Arizona Revised Statutes § 13-3005, interception offense:  
   https://www.azleg.gov/ars/13/03005.htm
3. Arizona Revised Statutes § 13-3012, exemptions:  
   https://www.azleg.gov/ars/13/03012.htm

Issuer: Arizona Legislature. Retrieval and verification date: 2026-08-08.

### Pinpoint propositions

- Section 13-3001(7) defines intercept as acquisition of communication contents through an electronic, mechanical, or other device.
- Section 13-3001(8) limits “oral communication” to speech uttered with an expectation against interception under circumstances justifying that expectation.
- Section 13-3005(A)(1) addresses intentional interception of a wire or electronic communication by a nonparty without consent of a sender or receiver.
- Section 13-3005(A)(2) addresses intentional interception of a conversation or discussion where the interceptor is not present, without consent of a party.
- Section 13-3012(9) exempts interception effected with the consent of a party to the communication or a person present during it.
- Section 13-3012 contains additional enumerated provider, public-radio, legal-process, public-access, and child-monitoring exceptions that must not be collapsed into a general meeting rule.

### Bounded claim

Arizona’s current statutory recording layer generally supplies a participant/one-party-consent path, but only after the communication type, recorder participation or presence, device-based acquisition, justified expectation, consent evidence, and any applicable exception are resolved.

### What this does not establish

This recording-layer result does not establish:

- that Arizona law governs a multistate meeting;
- consent to transcription, generated summaries, model processing, search, extraction, retention, training, disclosure, or publication;
- valid or noncoercive employee consent;
- privilege, confidentiality, trade-secret, public-records, discovery, records-schedule, privacy, sector, accessibility, language-access, or cross-border compliance;
- authority for a meeting bot, vendor configuration, or human pilot; or
- civil-liability, evidentiary, constitutional, or common-law consequences outside the cited statutory layer.

Disposition remains `human_notes_only` until the other MCAP-1.0 layers, exact meeting facts, exact data flow, qualified review, and multistate analysis are complete.

## Candidate-source register

| Candidate ID | Jurisdiction | Authority | Source | Use | Boundary |
|---|---|---|---|---|---|
| MB01-A1 | Alabama | Ala. Code § 13A-11-30 | https://alison.legislature.state.al.us/code-of-alabama?section=13A-11-30 | Official current section destination; definitions candidate | Portal text was not retrievable in this pass |
| MB01-A2 | Alabama | Ala. Code § 13A-11-31 | https://alison.legislature.state.al.us/code-of-alabama?section=13A-11-31 | Official current offense destination | Portal text was not retrievable in this pass |
| MB01-A3 | Alabama | Ala. Code § 13A-11-35 | https://alison.legislature.state.al.us/code-of-alabama?section=13A-11-35 | Official current disclosure-offense destination | Portal text was not retrievable in this pass |
| MB01-K1 | Alaska | AS 42.20.310 | https://www.akleg.gov/basis/statutes.asp#42.20.310 | Target current eavesdropping section | Exact current official text must be retrieved and pinned |
| MB01-K2 | Alaska | AS 42.20.320 | https://www.akleg.gov/basis/statutes.asp#42.20.320 | Target exemptions section | Exact current official text must be retrieved and pinned |
| MB01-R1 | Arkansas | Ark. Code § 5-60-120 | https://portal.arkansas.gov/service/arkansas-code-search-laws-and-statutes/ | Official current-code search destination | Exact consolidated section output must be retrieved and pinned |
| MB01-R2 | Arkansas | Act 1773 of 2001 | https://arkleg.state.ar.us/Acts/FTPDocument?ddBienniumSession=2001%2FR&file=1773.pdf&path=%2FACTS%2F2001%2FPublic%2F | Official enacted historical amendment | Not proof of the complete current section or later history |

## Search log

| Date | Jurisdiction | Search | Result | Next action |
|---|---|---|---|---|
| 2026-08-08 | Alabama | Current §§ 13A-11-30, -31, -35 on official Legislature portal | Destinations confirmed; text not exposed | Retrieve official body through portal/API or official print code; then check amendments and controlling appellate construction |
| 2026-08-08 | Alaska | Current AS 42.20.310 and .320 on official Legislature site | Bill/history results located; consolidated text not obtained | Retrieve current official chapter, definitions, offense, disclosure, exemptions, penalties, remedies, and appellate construction |
| 2026-08-08 | Arizona | Current ARS §§ 13-3001, 13-3005, 13-3012 | Official current text retrieved and reconciled | Add remedies/evidence and controlling appellate interpretation; complete remaining six packet layers |
| 2026-08-08 | Arkansas | Current Ark. Code § 5-60-120 on official Legislature portal | Official portal and historical act located; current section not exposed | Retrieve current official consolidated text, amendment history, remedies, related § 23-17-107, and controlling appellate interpretation |

## Integration gate

This batch does not silently alter the canonical matrix, claim ledger, source register, or Source Desk. Arizona may be promoted there only in one reconciled commit that:

1. adds stable source and claim IDs;
2. preserves exact pinpoints and limitations;
3. updates the 51-row matrix from seven to eight partial recording layers;
4. updates the contradiction record and public count;
5. regenerates any governed promise or evidence registry affected by the public wording; and
6. passes structured, link, secret-history, and preview checks.

Alabama, Alaska, and Arkansas remain `unverified` until the missing current primary text and later-history checks are completed.
