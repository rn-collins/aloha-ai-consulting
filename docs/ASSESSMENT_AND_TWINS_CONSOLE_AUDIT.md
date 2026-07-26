# Assessment and Twins Console Audit

Date: 2026-07-26

## University assessment

Canonical route: `/university/assessment`

Decision: retain as an educational, browser-only roadmap generator.

### Findings

- The tool asks eight self-report questions.
- Opportunity ranking is produced by a simple deterministic rubric based primarily on selected bottlenecks and the stated near-term goal.
- The result is not a psychometric score, validated diagnostic, risk prediction, or individualized professional determination.
- The page already states that it is a structured self-reflection tool rather than a validated or predictive instrument.
- Inputs and calculations run client-side. The optional email action opens the user's own mail client and does not submit the address to Aloha AI.
- `/assessment` permanently redirects to this canonical route.

### Required publication standard

The tool may be described as an assessment only in the ordinary educational sense. Public copy must continue to disclose that:

1. results are generated from a transparent rule-based mapping;
2. no validation study or predictive claim is being made;
3. the output does not diagnose an organization or replace qualified professional review;
4. no user-entered data is transmitted or stored by the site;
5. service recommendations are commercial pathways, not evidence that a particular purchase is necessary.

### Next implementation pass

- Rename result language from “score” to “roadmap result” wherever practical.
- Publish the rubric or a plain-language methodology note.
- Replace links to redirected University consulting pages with canonical `/services` and `/strategy` destinations.
- Add test cases covering empty selections, ties, sensitive-data responses, and each service-mode branch.

## Twins console

Canonical route: `/twins/console`

Decision: retain as a public demonstration, but remove it from search indexing and treat it as a product demo rather than a private operational console.

### Findings

- The page contains seeded sample data and client-side simulations.
- It explicitly states that there are no accounts, network calls, production sending, or live credentials.
- The page demonstrates pipeline views, review queues, guardrail behavior, persona material, and an acceptance scorecard.
- The route name and console-like interface could otherwise imply a live or private operational environment.

### Controls applied

- Added `X-Robots-Tag: noindex, nofollow, noarchive` for `/twins/console`.
- The page remains directly accessible from the Twins product estate for demonstration and review.
- No authentication claim is made because the current page does not contain private data or production controls.

### Required publication standard

The page must continue to state prominently that it is:

1. a demonstration;
2. populated with seeded sample data;
3. entirely client-side;
4. incapable of sending messages or accessing production systems;
5. not evidence that the demonstrated guardrails have been independently validated or certified.

## Sitemap action

Remove the following noncanonical or nonindexable routes from the next sitemap revision:

- `/university/services`
- `/university/services/ai-governance-setup`
- `/university/services/ai-implementation`
- `/university/services/ai-strategy-sprint`
- `/university/services/ai-workflow-design`
- `/university/services/ongoing-advisory`
- `/twins/console`

Retain `/university/services/team-training` as the distinct institutional training offer.