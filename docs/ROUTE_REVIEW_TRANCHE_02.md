# Route review tranche 02

Date: 2026-07-26

## Review standard

No route is merged, redirected, noindexed, archived, or removed merely because it overlaps another page or uses an unusual route name. Each decision below follows a substantive comparison of audience, promise, deliverables, commercial role, evidence, and risk.

## `/practice`

Decision: retain temporarily; do not redirect yet.

Reasoning:

- The page is a developed legacy consulting-practice page, not an empty duplicate.
- It contains pricing, positioning, framework descriptions, service language, and potentially unique material not yet fully reconciled into the rebuilt Services, Strategy, About, Methods, and Engagements pages.
- Its current design, navigation, and commercial taxonomy are inconsistent with the rebuilt core site.

Required next action:

1. extract all unique claims, offers, prices, frameworks, and proof;
2. assign each item to a canonical destination;
3. confirm preservation;
4. only then choose between a revised `/practice` page and a permanent redirect.

## `/ai-native-coo`

Decision: keep as a distinct service page; revise rather than merge.

Reasoning:

- The page answers a different buyer question from `/strategy`.
- `/strategy` concerns AI capability, governance, implementation leadership, and the organization's AI operating model.
- `/ai-native-coo` concerns founder-level company operations: priorities, decision systems, knowledge, content, revenue, projects, cadence, and execution.
- The page already distinguishes the two executive functions explicitly.

Required revision:

- migrate navigation and footer links to clean canonical routes;
- reconcile pricing and scope language with the canonical Services page;
- add clearer qualification, dependency, capacity, and conflict boundaries;
- define whether the role is advisory, fractional executive operation, implementation management, or a combination in each tier.

## `/launch-stack`

Decision: keep as a separate, narrowly scoped productized service.

Reasoning:

- The page explicitly describes a non-AI web-and-operations build.
- The offer serves buyers who need a custom-owned frontend connected to ordinary business functions such as registration, payments, booking, contact management, and email.
- This is commercially and operationally distinct from knowledge systems, governed AI workflows, and fractional AI leadership.

Required revision:

- state the supported and excluded backend categories;
- identify who pays third-party software, transaction, hosting, and domain fees;
- specify accessibility, security, privacy, maintenance, support, backups, handoff, and change-request terms;
- avoid implying that every site is fully portable when third-party backend dependencies remain;
- reconcile tier pricing and fulfillment capacity.

## `/engagements`

Decision: keep, but correct immediately.

Issue found:

The page described several proposal-stage or independently produced packages as real consulting engagements while source comments stated that the underlying client engagements were not signed. Anonymization does not resolve that accuracy problem.

Correction implemented:

- commissioned active work is separated from pre-engagement research and prototypes;
- proposal-stage work is explicitly labeled as independent pre-engagement work;
- the page states that no client engagement is claimed for those packages;
- public naming remains permission-dependent;
- navigation, metadata, canonical links, and professional boundaries were standardized.

## Current decision summary

| Route | Decision | Index state |
|---|---|---|
| `/practice` | retain pending evidence-preserving reconciliation | indexed |
| `/ai-native-coo` | keep and revise as distinct service | indexed |
| `/launch-stack` | keep and revise as distinct productized service | indexed |
| `/engagements` | keep; status claims corrected | indexed |

## Next tranche

1. verify the corrected `/engagements` page in production;
2. audit `/university/services` and each child page individually;
3. compare `/assessment` and `/university/assessment` logic and privacy;
4. review `/twins/console` as a public demonstration rather than presuming it is private;
5. complete the evidence-preservation map for `/practice`.