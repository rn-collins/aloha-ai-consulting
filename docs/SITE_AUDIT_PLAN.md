# Aloha AI site-wide audit control plan

Last substantive update: 2026-07-26

## Purpose

This directory is the control center for rationalizing the Aloha AI web estate. The public property currently contains the core consulting practice, product families, free tools, diagnostics, regulatory monitors, proof pages, Aloha AI University, continuing education, and legacy or overlapping routes. The audit prevents those assets from being revised independently without a stable company architecture.

## Canonical site branches

1. Services
2. Products
3. Tools
4. Education
5. Proof
6. Company

Every public route must be assigned to one branch. A route that cannot be assigned must be reviewed before any keep, merge, redirect, archive, `noindex`, or removal decision is made.

## Source of truth

`docs/site-audit-register.csv` is the route-level register. Each route receives:

- page type;
- primary audience;
- current status;
- recommended action;
- priority.

The register begins with 110 known routes drawn from the current sitemap, homepage links, and active product/tool paths. It must be expanded whenever another public or orphaned route is found.

## Priority meanings

- P0: legal, regulatory, privacy, indexing, data, product-fulfillment, or credibility risk.
- P1: core commercial architecture and proof.
- P2: product and education architecture.
- P3: lesson-level depth, consolidation, and maintenance.
- P4: reusable templates, CMS/content operations, automation, and scale.

## Definition of a reviewed route

A route is not complete merely because it loads. Completion requires:

- canonical URL;
- audience and visitor problem;
- one page promise;
- primary and secondary calls to action;
- clear product/service/status classification;
- factual and claim review;
- evidence class and source basis;
- visible last-reviewed date where freshness matters;
- legal/professional limitation language where needed;
- privacy and data-flow review;
- mobile, keyboard, heading, contrast, and form review;
- maintenance owner and cadence;
- keep, revise, merge, redirect, archive, `noindex`, or remove decision.

## First implementation tranche

1. Create and maintain the route register.
2. Rebuild the sitemap around reviewed canonical public pages.
3. Preserve existing public routes while they are being reviewed; do not infer that an unfinished, overlapping, or specialized page should be hidden before substantive review.
4. Audit and rationalize the nine core pages:
   - Services
   - Strategy and Fractional Leadership
   - Regulatory and Market Intelligence
   - Content and Adoption Systems
   - Legal AI Workflow
   - Builds
   - Methods
   - Partners and Licensing
   - About
5. Review assessments and University service routes individually before any consolidation decision.
6. Review P0 legal, regulatory, privacy, and diagnostic routes before making strong public claims about accuracy, compliance, exposure, or live status.

## Canonical language

Parent category:

> Aloha AI builds knowledge, decision, and operating systems for complex work.

Specialization:

> We specialize in environments where evidence must be traceable, rules and exceptions matter, and a human remains accountable.

Core transformation:

> Aloha AI turns expertise into infrastructure.

These statements organize the site. They do not replace route-specific descriptions of the buyer, deliverable, evidence, limitations, and commercial terms.

## Sitemap rules

The sitemap must contain canonical, indexable pages that have been substantively reviewed. It must not contain:

- protected or genuinely private consoles;
- preview deployments;
- result-only URLs;
- confirmed duplicate URLs;
- both `.html` and extensionless versions of the same page.

A public demo, specialized service page, lesson, or experimental product is not removed from the sitemap merely because it is unusual or still needs refinement. Its actual content, purpose, audience, evidence, privacy, and strategic role must be reviewed first.

Removing a route from the sitemap does not delete it. Redirects, `noindex`, authentication, or removal must be handled separately after route review.

## Deployment rules

- Use a branch for site-wide architecture changes.
- Run the repository link checker and secret scan.
- Inspect the Vercel preview.
- Merge only after the route set and canonical behavior are correct.
- Verify the production alias, response status, metadata, and runtime errors after merge.

## Open infrastructure items

- Reconcile or disconnect the duplicate Vercel project `aloha-ai-consulting-an6n`.
- Choose and attach a custom domain.
- Replace the temporary homepage rewrite with a rationalized canonical root file after the architecture stabilizes.
- Verify the actual privacy implications of Vercel Analytics, Speed Insights, forms, diagnostics, storage, and external booking.
- Establish a professional company email and role-specific inquiry paths.
