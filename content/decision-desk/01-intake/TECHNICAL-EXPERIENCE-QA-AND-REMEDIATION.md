# Issue 01 technical experience QA and remediation

Status: completed technical review and first remediation pass; not human accessibility validation; not release authorization  
Branch baseline: `10a0aaa`  
Review date: 2026-08-08  
Scope owner: RN Collins / Aloha AI

## User story

A visitor can read the Issue 01 article and Source Desk, distinguish the inactive masterclass from the inactive clinic, run either browser-local synthetic fit check, understand incomplete and successful states, preview safe failure outcomes, and leave without creating personal data, a registration, payment, booking, seat, calendar event, or message.

## Evidence reviewed

- canonical semantic HTML for the Issue 01 article, public Source Desk, masterclass, and clinic;
- shared `program.css`, `program-journey.js`, and `site-shell.js`;
- heading order, landmark structure, skip links, labels, fieldsets, legends, image alternatives, table headers/scopes, live regions, focus targets, reset behavior, mobile breakpoints, and inactive data boundary;
- current GitHub structured validation, link checking, secret-history scan, and two Vercel deployment checks.

## Defects found and remediated

### EX-01 · Required synthetic conditions were not programmatically exposed

Severity: high for screen-reader-oriented operation; no commercial or data consequence because the journeys are inactive.

Before: JavaScript required every checkbox, but the controls lacked the HTML `required` state. The result announced only a missing count.

Remediation:

- added `required` to all four masterclass and seven clinic conditions;
- marks each unchecked condition `aria-invalid="true"` after an incomplete attempt;
- clears invalid state when corrected, on successful evaluation, and on reset;
- preserves the focused polite result announcement and no-data language.

### EX-02 · Dense evidence tables lacked a responsive keyboard region

Severity: high at narrow viewports and 400% zoom.

Before: four multi-column evidence tables had correct headers and scopes but no bounded overflow region. The shared data-table style applied only to `.table-wrap table.data`, which these editorial tables did not use.

Remediation:

- wrapped each table in a named `role="region"` with `tabindex="0"`;
- added bounded horizontal overflow, visible keyboard focus, preserved table semantics, readable cell borders, and long-link wrapping;
- retained the table's original accessible name.

## Executed technical checks

| Check | Result | Evidence boundary |
|---|---|---|
| One H1 and ordered H2/H3 hierarchy per reviewed route | Pass | canonical HTML inspection |
| Skip link and main landmark | Pass | canonical HTML inspection |
| Checkbox accessible names and grouped legends | Pass after EX-01 | explicit label wrapping, fieldset, legend, required state |
| Incomplete, eligible/screening, reset, and six preview-state code paths | Pass by deterministic code-path review | browser-local JavaScript; no API or persistence |
| Dynamic result announcement and focus | Pass | `role="status"`, `aria-live="polite"`, `tabindex="-1"`, explicit focus |
| Image alternatives and captions | Pass within technical scope | two article SVGs have descriptive alt text and captions |
| Table header relationships | Pass | column headers and Source Desk row headers retain `scope` |
| Narrow-screen table containment | Pass after EX-02 within CSS/code scope | explicit scroll region; visual browser observation still open |
| Personal-data, API, payment, booking, calendar, and message creation | Absent | checkbox-only forms, prevented submit, no form action/fetch/storage |
| Automated repository checks | Previously pass at baseline | must rerun on remediation head |

## Unperformed checks and release boundary

The protected preview requires a cookie-capable browser. The available runner could not install Chrome because the browser-distribution certificate chain was rejected by this environment. Therefore this record does **not** claim:

- observed desktop or mobile visual QA;
- actual keyboard traversal in Chrome, Safari, Firefox, or Edge;
- 200%/400% zoom and reflow observation;
- VoiceOver, NVDA, JAWS, TalkBack, or other assistive-technology operation;
- automated axe results from a rendered page;
- representative-user or human accessibility validation;
- email-client, payment, booking, calendar, or message testing.

Those gates remain open. The finite next action is to rerun the browser matrix when a functioning cookie-capable browser surface is available; any critical/high defect must be remediated before RN release approval.
