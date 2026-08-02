# R07 Progress Report 09 — Accessibility Assurance

Date: 2026-08-02

Status: passed within the documented static-structure and interaction-contract boundary and verified in production; Unit 9 closed; R07 remains open

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

PASS within the stated boundary. GitHub `main` evaluation commit `9de98036cbf53018183f3263e94c06ceb08c2262` has Git tree `2976e78cb85e1934dbddc49738cf4d1c6f6ed977`, exactly matching the locally tested tree. It deployed through Vercel production deployment `dpl_8cfxoxiPURQz1SCtCsXxQ7z1bAFj`.

Production verification established:

- The deployment reached `READY`, targeted production, and Vercel metadata identified exact GitHub commit `9de98036cbf53018183f3263e94c06ceb08c2262`.
- `/accessibility`, `/api/evaluations/accessibility.json`, `/api/assurance-manifest.json`, `/methods`, and `/tools/trust-safe-console` returned HTTP 200 from the canonical domain.
- The live accessibility statement publishes both private reporting instructions, the alternative-format/accommodation path, the remediation commitment, and the manual-testing exclusions.
- The live evaluation reports 12 checks, 12 passes, zero failures, zero structural findings, 498 sitemap routes, 41 tables, 1,868 controls, and 30 forms.
- The live assurance manifest reports three boundedly evaluated site-assurance domains, four remaining required domains, zero certified domains, and zero errors.
- The live Methods table contains an accessible caption and `scope="col"` header associations.
- The live Trust-Safe Console gives both textareas programmatic names and exposes its changed human-review result through `role="status"` and `aria-live="polite"`.
- The live record preserves the explicit non-certification boundary for WCAG conformance, legal compliance, complete rendered contrast, assistive technology, third-party destinations, and future deployments.

R07 Unit 9 is closed.

R07 remains open for four evidence-producing site-assurance domains after this unit closes: corrections, legal authority, rights and attribution, and institutional credentials.
