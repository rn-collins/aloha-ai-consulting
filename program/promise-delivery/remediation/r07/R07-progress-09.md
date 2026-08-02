# R07 Progress Report 09 — Accessibility Assurance

Date: 2026-08-02

Status: passed locally within the documented static-structure and interaction-contract boundary; production verification pending; R07 remains open

Frozen audit baseline: 4,289 promise records / 9,552 occurrences; unchanged

## Scope and decision

Unit 9 evaluated every route in the generated sitemap plus the shared HTML, CSS, interaction, and rendering contracts that create those routes. The unit grants a bounded structural and interaction-contract pass only. It does not claim WCAG conformance, legal compliance, complete rendered contrast coverage, or manual assistive-technology compatibility.

Disposition: passed-limited for the dated checked-in public-site boundary after remediation. Production verification remains required before closure.

## Material findings and remediation

The previous whole-site audit covered skip links, H1 count, image alternatives, and basic form labels but omitted several accessibility controls. The expanded release-blocking evaluator initially found 86 defects:

- 41 data tables lacked accessible names;
- 41 data tables lacked programmatic header associations; and
- four Trust-Safe Console textareas lacked accessible names across the canonical and twin routes.

Shared renderer corrections added visually hidden table captions, `thead` structure, column-header scopes, row-header scopes where authored, textarea names, and a live status announcement for human-review actions. Rebuilding the estate cleared all 86 findings at their shared source.

## Public statement and reporting path

The canonical `/accessibility` statement now publishes:

- the exact public-site boundary;
- the repeatable controls currently checked;
- a private “accessibility report — no meeting needed” path;
- a private “accessibility accommodation — no meeting needed” path;
- a remediation and regression-testing commitment; and
- explicit disclosure that screen-reader, voice-control, switch-control, screen-magnifier, complete rendered-contrast, third-party, and legal-conformance testing remain open.

## Evidence and controls

- `scripts/evaluate-accessibility-assurance.js` checks every sitemap route and fails release on structural or contract regressions.
- `/api/evaluations/accessibility.json` and its canonical content copy record the inventory, checks, findings, exclusions, assistive-technology evidence gap, owner, review date, trigger, and prohibited inference.
- The assurance registry records Accessibility as `passed-limited`, not certified.
- The release-control test requires Privacy, Security, and Accessibility to remain bounded while the four unfinished domains continue to fail closed.

## Local acceptance result

- 12/12 bounded accessibility checks passed.
- 498/498 sitemap routes were evaluated.
- Zero structural findings remained after remediation.
- 41 tables now have accessible names and programmatic header associations.
- Four previously unnamed textareas now have accessible names.
- Manual assistive-technology evidence remains explicitly unperformed and is a required retest item.

## Production verification

Pending publication. This section must record the exact GitHub evaluation commit, Vercel production deployment, live accessibility statement, live evidence and assurance manifest, representative corrected table markup, named Trust-Safe Console controls, and response status before Unit 9 closes.

R07 remains open for four evidence-producing site-assurance domains after this unit closes: corrections, legal authority, rights and attribution, and institutional credentials.
