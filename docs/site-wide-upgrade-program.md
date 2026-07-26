# Aloha AI whole-site upgrade program

## Scope

This program governs the entire public site and authenticated product. Trust-Safe Twins are one product estate inside Aloha AI. They are not the organizing concept for every page.

The authoritative route inventory begins with `sitemap.xml` and is classified by `lib/site/route-registry.js`. The executable baseline audit is `scripts/audit-entire-site.js`.

## Site estates

### Aloha AI commercial practice

Includes the home page, services, strategy, intelligence, content, legal AI, team building, AI-native COO, launch stack, engagements, methods, builds, partners, practice, and about.

Its job is to explain what Aloha AI does, establish RN's authority and range, show concrete proof, distinguish the offers, and move qualified visitors toward the right engagement.

### Trust Stack

Includes the Trust Stack index and each governance, compliance, regulatory, verification, risk, and suppression product.

Its job is to make the trust architecture legible: the problem addressed, inputs, method, outputs, limitations, status, evidence, and available next action.

### Tools, monitors, systems, and teardowns

Includes public diagnostics, scorecards, maps, monitors, working systems, and workflow teardowns.

Its job is to let visitors use or inspect the work. Each page must state whether the experience is live, demonstrative, research-only, or awaiting activation.

### Aloha AI University

Includes entry pathways, lessons, playbooks, templates, use cases, tool guides, assessments, institutional services, and University company pages.

Its job is to teach, sequence learning, support practice, and distinguish individual learning from team training, consulting, complete-program purchase, institutional licensing, and continuing education.

### Programs and continuing education

Includes CE and future purchasable or licensable programs. These offerings must remain distinct from Aloha AI consulting and from free University material.

### Trust-Safe Twins

Includes the Twin catalog, individual Twin products, public demonstrations, and the Twin Lab. Its job is to expose governed AI workflows for users who need them. Twin terminology must not replace ordinary language on unrelated pages.

### Aloha AI Platform

Includes the public platform explanation and authenticated workspace. Its job is to persist projects, evidence, workflows, runs, evaluations, human reviews, approvals, deliveries, integrations, and audit records.

### Legal and policy

Includes privacy, terms, and future operational policies. These pages must accurately describe actual data handling and platform status.

## Global information architecture

The primary navigation should answer four visitor intentions:

1. What does Aloha AI do?
2. What has Aloha AI built and how does it work?
3. What can I use or learn now?
4. How do I work with Aloha AI or enter the platform?

Recommended top-level model:

- Work with us
  - Services
  - Strategy
  - Legal AI
  - Training and programs
  - Engagements
- Products and intelligence
  - Trust Stack
  - Tools
  - Monitors
  - Trust-Safe Twins
- Proof and methods
  - Builds
  - Methods
  - Teardowns
  - Partners
- Learn
  - University
  - Playbooks
  - Templates
  - Use cases
  - Continuing education
- Company
  - About
  - Practice
  - Contact or engagement path
- Platform
  - Public platform page
  - Sign in or workspace

Navigation labels must be tested against actual visitor comprehension before final implementation.

## Universal page requirements

Every public page must have:

- one precise purpose;
- a named or unmistakable audience;
- one primary action;
- a useful secondary path;
- accurate title, description, canonical URL, and social metadata;
- exactly one page-level H1;
- semantic header, navigation, main, and footer regions;
- keyboard access and visible focus;
- responsive behavior at phone, tablet, laptop, and wide-screen widths;
- truthful live, demo, research, beta, or inactive status;
- internal links that connect the page to its parent estate and relevant adjacent pages;
- no unsupported claims or empty prestige language;
- no dead buttons, placeholder destinations, or unexplained forms.

Every interactive page must additionally have:

- instructions before interaction;
- data-use and confidentiality explanation;
- loading, empty, success, and error states;
- result interpretation;
- limitations;
- a reset or recovery path;
- accessible form labels and validation;
- a clear boundary between browser-only work and persisted workspace work.

## Page-specific contracts

The machine-readable baseline lives in `lib/site/route-registry.js`.

### Commercial landing pages

Must establish the audience, problem, offer, evidence, deliverables, boundaries, process, commercial next step, and related proof.

### Product pages

Must establish the product's user, problem, method, inputs, outputs, limitations, maturity, methodology, and next action.

### Tools and diagnostics

Must establish instructions, data handling, status, methodology, result meaning, limitations, and the relationship to paid work.

### Learning pages

Index pages must show pathways, level, time, outcomes, and progression. Individual items must include an objective, prerequisites, instruction, worked example, practice, verification, and next step.

### Authenticated application pages

Must include permission-aware states, loading and failure handling, provenance, version history where relevant, and clear audit consequences for irreversible actions.

## Upgrade sequence

### Tranche 1: Inventory and enforceable baseline

- classify every sitemap route;
- detect missing route files;
- audit metadata and semantic structure;
- detect shared-design-system coverage;
- create a route-level remediation register;
- identify sitemap omissions and pages that should be removed, merged, redirected, or renamed.

### Tranche 2: Global shell

- finalize information architecture;
- create the universal header, mobile navigation, footer, breadcrumbs, page title region, call-to-action system, status labels, cards, forms, tables, disclosures, and error states;
- migrate the home page first;
- verify accessibility and responsive behavior before broad rollout.

### Tranche 3: Commercial practice

Upgrade the home page and every commercial, proof, methods, company, partnership, and engagement page. Resolve overlap among Services, Strategy, Intelligence, Content, Legal AI, Build Your Team, AI-Native COO, and Launch Stack.

### Tranche 4: Product estates

Upgrade Trust Stack, tools, monitors, systems, teardowns, and Twins using a shared product-page contract while preserving the distinctions among them.

### Tranche 5: University, programs, and CE

Build coherent learner pathways and separate free learning, templates, assessments, team services, complete-program purchase, institutional licensing, and CE.

### Tranche 6: Platform and public-to-workspace continuity

Complete the public platform page, public-lab continuation control, safe handoff, authenticated workspace, review interfaces, and status-aware integrations.

### Tranche 7: Site-wide verification

Audit every route for content, visual design, mobile behavior, accessibility, metadata, internal links, forms, status accuracy, analytics, and conversion. No estate is complete until all of its routes pass the agreed completion standard.

## Definition of done

The site-wide upgrade is complete only when:

- every intended public and authenticated route is inventoried;
- every sitemap route resolves correctly or has an intentional redirect;
- every route is assigned to an estate and page contract;
- all pages use the shared shell and design system unless a documented product requirement justifies an exception;
- every page has been reviewed on phone and desktop;
- automated structural checks pass;
- manual content, accessibility, usability, and visual reviews are recorded;
- University, CE, consulting, product, and platform offers are distinguishable;
- Twins occupy their proper place without dominating unrelated pages;
- all live-status claims match the actual infrastructure;
- the entire visitor journey works from discovery through use, learning, inquiry, account creation, and workspace continuation.
