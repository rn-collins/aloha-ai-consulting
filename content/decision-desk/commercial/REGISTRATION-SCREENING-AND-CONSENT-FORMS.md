# Registration, screening, and consent form specification

Status: draft form specification; collection inactive  
Version: 0.1

## Form A — masterclass registration

Collect only: name, email, timezone, selected session, preferred material format, private accessibility-contact request, required terms/privacy acknowledgments, and optional reminder preference.

Do not collect employer, role, workflow facts, matter facts, documents, or sensitive data. Required acknowledgments must confirm fictional-data use, educational scope, no CLE/certification/legal advice, cancellation terms, privacy notice, and Code of Conduct.

## Form B — clinic fit screen

Collect only: name, contact, organization/role if relevant, selected session, one-sentence nonconfidential workflow description, one bounded decision question, authority to discuss, access/contact preference, and the seven screening responses in the clinic intake record.

The form must warn before the text fields: do not enter names, case numbers, deadlines, client facts, health/financial data, credentials, documents, screenshots, or confidential text.

Possible outcomes: accept, one-question clarify, defer, decline/referral. No automated system may make the final accept/decline decision.

## Form C — participation acknowledgments

Render each required acknowledgment separately; do not bundle them into a single broad consent. Record text version and timestamp. Optional marketing, anonymized quotation, feedback retention, reminders, and waitlist choices must be separate, unchecked, and revocable. Recording permission is absent for the initial release.

## Validation and accessible behavior

- persistent labels, field instructions, error summaries, and programmatic error association;
- keyboard-only completion and logical focus order;
- no time limit; save-and-return only if privacy/expiry behavior is approved;
- timezone displayed beside every session;
- confirmation page repeats material terms;
- alternative private contact method;
- no inaccessible CAPTCHA or upload field;
- consent cannot be inferred from inactivity.

## Human-review queue

Only minimum screen data reaches the reviewer. The reviewer records outcome category and a short non-sensitive rationale. Clarification is limited to one bounded question. Declines do not solicit more facts. Accepted participants proceed to payment; if payment occurred earlier due to system design, decline triggers a full refund.

## Activation gate

Use synthetic records only until privacy, accessibility, security, retention, deletion, export, correction, duplicate-submission, abandoned-form, and malicious-input tests pass.
