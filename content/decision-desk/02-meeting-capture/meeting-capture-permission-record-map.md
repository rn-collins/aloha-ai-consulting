# Meeting Capture Permission and Record Map

Status: governed subscriber decision instrument for Decision Desk 02. Protocol-ready; no jurisdiction, product, or organization cleared. Not legal advice. Not approved for publication.

Blank or unresolved fields are stop conditions, not implied approvals. Complete one record for each meeting class and each materially different jurisdiction, participant population, purpose, product configuration, or data flow.

## Deterministic decision state

- Any `prohibited` or `fail` gate → **do not capture**.
- No failure, but any `unresolved` gate → **uncaptured meeting; preserve a human-authored decision record if appropriate**.
- Gates 1–5 pass → **synthetic configuration testing may begin**; this is not permission to record people.
- Gates 1–6 plus the preregistered synthetic evaluation pass → **consider a separately governed bounded pilot**.
- No state authorizes universal or default capture, covert capture, publication, sale, deployment, or a legal-compliance claim.

## 1. Decision record

- Organization / team:
- Decision owner:
- Meeting-class owner:
- Records owner:
- Privacy/security reviewer:
- Labor/employment reviewer:
- Legal jurisdictions and participant locations:
- Date opened / review date:
- Proposed disposition: do not capture / human notes only / redesign / synthetic test / bounded pilot for separate approval

Gate 1: If the owner, meeting class, affected people, locations, and purpose are not specific, stop.

Gate 1 disposition / evidence / reviewer / date:

## 2. Meeting class before technology

- Meeting class:
- Concrete purpose requiring capture:
- Why ordinary notes or a human-approved decision log are insufficient:
- Expected participants and bystanders:
- Power relationships:
- Remote, in-person, or hybrid:
- Recurring or one-time:
- Expected sensitivity:
- Meaningful non-capture alternative:

Presumptive no-capture flags: privileged or legal strategy; personnel or performance; health or accommodation; safety or security; protected labor or organizing activity; sensitive community or cultural knowledge; relationship repair; minors or vulnerable participants; confidential negotiation; whistleblowing or complaint; any meeting whose purpose depends on candor that capture would materially impair.

Gate 2: A flagged class is `prohibited` unless a separately documented authority, necessity, affected-person process, and narrower design overcome the presumption. Convenience is insufficient.

Gate 2 disposition / exception record / reviewer / date:

## 3. Authority, notice, and meaningful choice

For every participant location and later use, record the controlling or relevant authority, effective date, pinpoint, reviewer, and disposition for:

- recording and interception;
- consent and notice;
- employment monitoring and workplace privacy;
- protected concerted or labor activity and collective agreements;
- confidentiality, privilege, and professional duties;
- public records, discovery, litigation hold, and retention;
- sector-specific and special-category data;
- accessibility and language access;
- cross-border transfer and data localization; and
- biometric, voiceprint, or automated-decision rules if applicable.

Choice design:

- Notice delivered before capture:
- What is collected and generated:
- Purpose and later uses:
- Who can access, search, export, or share:
- Retention and deletion:
- How to decline, pause, correct, complain, or participate without capture:
- Consequence of declining:
- Method for late arrivals, guests, bystanders, and changed purpose:

Gate 3: Any unresolved high-risk authority, invalid or coercive choice process, undisclosed later use, or missing non-capture path means no capture.

Gate 3 disposition / authority packet / qualified reviewers / date:

## 4. Four-record map

Complete separately; “same as above” is not permitted.

| Record | Is it necessary? | Authoritative status | Data included | Access roles | Retention / deletion | Correction route | Export / downstream uses |
|---|---|---|---|---|---|---|---|
| Raw audio/video | | | | | | | |
| Transcript | | | | | | | |
| Generated summary | | | | | | | |
| Human-approved decision record | | | | | | | |

The transcript and generated summary are never authoritative by default. The decision record must identify commitments, owners, dates, dissent, unresolved questions, approver, and source references without silently importing every captured utterance.

Gate 4: If the four artifacts cannot be separated by purpose, authority, access, correction, and retention, redesign without capture.

Gate 4 disposition / record schedule / reviewer / date:

## 5. Exact system and data flow

- Vendor / product / tier:
- Model / version / release date:
- Bot identity and join behavior:
- Enabled / disabled features:
- Tenant and administrator settings:
- Integrations and inherited permissions:
- Data received and generated:
- Training or product-improvement use:
- Provider or human access:
- Subprocessors and storage geography:
- Encryption, audit logs, export, deletion, and incident notice:
- Material-change notice and change-control owner:
- Reproducible configuration record:

Gate 5: If the exact configuration and complete data flow cannot be named, frozen, reproduced, and contractually evaluated, no participant capture or pilot.

Gate 5 disposition / dossier version / reviewer / date:

## 6. Predeployment evaluation

Use wholly fictional meetings first. Test speaker attribution, interruptions, overlap, accents, dialects, languages, domain vocabulary, poor audio, late arrival, correction, refusal, bot removal, access boundaries, retention, deletion, exports, and changed purpose. Test both output quality and human behavior.

Universal stop conditions include unauthorized joining or access; failure to stop or delete; critical speaker, owner, decision, deadline, dissent, or negation error; summary presented as the authoritative decision; inaccessible notice or correction; material participant withholding or side-channel migration; and configuration drift during testing.

Gate 6: If representative failure modes or affected people are missing, or any universal stop condition occurs, reject or redesign.

Gate 6 disposition / protocol / test-set version / reviewer / date:

## 7. Final disposition

- Do not capture
- Use human notes and a decision log
- Redesign and retest
- Authorize synthetic configuration testing
- Consider a separately governed bounded pilot

Reasoning:
Supporting evidence:
Counterevidence:
Affected-person input:
Remaining uncertainty:
Conditions and prohibited uses:
Expiration / change trigger:
Named sign-offs:

## Machine-checkable handoff

```text
map_version:
meeting_class:
jurisdictions:
product_configuration_version:
authority_packet_version:
protocol_version:
gate_1: pass | fail | unresolved
gate_2: pass | prohibited | unresolved
gate_3: pass | fail | unresolved
gate_4: pass | fail | unresolved
gate_5: pass | fail | unresolved
gate_6: pass | fail | unresolved | not_run
decision: do_not_capture | human_notes_only | redesign | synthetic_test_authorized | bounded_pilot_for_separate_approval
decision_owner:
qualified_reviewers:
decision_date:
expiration_or_change_trigger:
```
