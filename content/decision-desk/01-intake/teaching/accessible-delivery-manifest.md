# Decision Desk 01 — accessible delivery manifest

Version 1.0 · draft production specification · not a claim of human validation

## Delivery set

The release package must provide the same substantive content in:

- accessible HTML as the canonical reading format;
- tagged PDF only after tag-order, headings, tables, links, language, metadata, and reading order are verified;
- editable DOCX for the workbook and Evaluation Card only after semantic-structure QA;
- plain-text alternatives for every essential visual, diagram, table, and timed prompt;
- captions or an accurate transcript for any recorded or live audiovisual material.

Markdown files in this repository are source records, not final accessible deliverables.

## Version control

Every participant file must display: title, version, issue number, publication date, correction date if applicable, and canonical URL. The article, Source Desk, workbook, case packet, blank card, and follow-up guide must share a release identifier. Facilitator-only answers must be clearly marked and withheld until debrief.

## Access requirements

- Logical heading hierarchy and document title.
- Native lists and tables with headers; no layout tables.
- Descriptive links that make sense out of context.
- Sufficient contrast; meaning never communicated by color alone.
- Body text remains readable at 200% zoom and reflows where the format permits.
- Keyboard order follows visual and semantic order.
- Form fields have programmatic names, instructions, and error recovery.
- Images have useful alt text or are marked decorative.
- Complex visuals include adjacent long descriptions.
- No exercise requires dragging, handwriting, speech, camera use, or rapid timed response.
- Participants can use written, spoken, or untimed participation without penalty.
- Dates and session times include timezone and an unambiguous date.

## Required QA record

For each final format, record tester, date, version, platform, browser/app, keyboard result, screen-reader result, zoom/reflow result, link result, form result, contrast result, issues, remediation, and disposition.

Technical review should include at minimum keyboard-only operation, 200% zoom/reflow, automated checks, and one current desktop screen reader. Representative-user testing remains an open gate until actually completed; do not imply it occurred.

## Distribution and privacy

Use the minimum participant data necessary. Do not place participant names, submissions, scores, access requests, or feedback in public files. Access requests must travel through an approved private support channel. No participant exercise may contain real client, prospective-client, employer-confidential, privileged, or sensitive personal information.

## Failure dispositions

- If a tagged PDF cannot pass: distribute accessible HTML and an editable structured alternative; label PDF unavailable.
- If live captions fail: pause, restore captions, or move to the accessible transcript/workbook path.
- If a participant cannot access an activity: stop the activity and provide the equivalent untimed alternative.
- If a defect changes meaning or the bounded disposition: withdraw the affected file until corrected.
- If only technical QA is complete: say so and keep human-validation status open.

## Release checklist

- [ ] Canonical HTML complete.
- [ ] DOCX exports inspected, not merely generated.
- [ ] PDFs tagged and manually checked, or intentionally omitted.
- [ ] Plain-text alternatives complete.
- [ ] Caption/transcript path tested.
- [ ] Keyboard, screen reader, zoom/reflow, forms, links, and contrast recorded.
- [ ] Access-request channel tested privately.
- [ ] Version identifiers reconcile across files.
- [ ] Known barriers and fallbacks disclosed.
- [ ] RN approves the final delivery set.
