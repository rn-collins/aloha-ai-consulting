# Legacy route review

Review date: 2026-07-26

No route is redirected, noindexed, archived, or removed solely because it appears old or duplicates another label. Decisions require a substantive content review.

## `/practice`

**Decision: keep temporarily and restore to the sitemap while it is reconciled.**

The page is not empty or obsolete. It contains a substantial earlier articulation of the practice, including services, positioning, proprietary frameworks, IP, tools, and builds. Its weaknesses are architectural: it duplicates the homepage, Services, Methods, and About; uses an older design system and category language; and may contain stale claims and counts. The valuable material should be mapped into the current site before any redirect is implemented.

## `/memo`

**Decision: remove stale sitemap entry; no redirect yet.**

The public route currently returns 404 and no corresponding repository file was located. This is not a content-removal decision; it corrects a sitemap entry that points to no page. If a memo artifact is later located, it must be reviewed and assigned an appropriate route before indexing.

## `/assessment`

**Decision: review against the current assessment estate before changing index status.**

The route must be compared with the University assessment, readiness scorecards, Build Your Team diagnostic, Trust Stack Leak Check, and Twins Exposure Check. No redirect or noindex should be implemented until its distinct purpose and scoring logic are inspected.

## `/twins/console`

**Decision: inspect operational status and data handling before indexing.**

A console-like route may be a public demonstration, an operational interface, or a private administration surface. Its indexing status depends on authentication, data exposure, functionality, and whether the UI could mislead a visitor about production readiness.

## University service routes

**Decision: preserve pending page-by-page review.**

They may be legitimate education-specific service pages rather than simple duplicates. Each must be compared with the main commercial service page for audience, deliverables, pricing, and learning context before consolidation.

## University lessons, playbooks, templates, tools, and use cases

**Decision: retain existing routes and review in curriculum order.**

Removing lesson-level URLs from a sitemap before quality review can suppress useful educational content. They should be indexed when complete, substantive, accurate, internally linked, and maintained; otherwise they should remain accessible but temporarily noindexed. That determination must be made page by page.
