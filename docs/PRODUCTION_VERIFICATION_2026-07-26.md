# Production verification — 2026-07-26

## Deployment

- Canonical Vercel project: `aloha-ai-consulting`
- Production branch: `main`
- Git-triggered production deployment: restored and verified
- Canonical production alias: `https://aloha-ai-consulting.vercel.app`
- Latest verified routing-fix commit: `9a08c6204b37215951e3d134e60e6dff18153343`
- Production runtime errors in the preceding 24 hours: none reported by Vercel

## Canonical core routes

The following routes are live, return HTTP 200, and are intended as the canonical commercial and institutional layer:

- `/services`
- `/strategy`
- `/intelligence`
- `/content`
- `/legal-ai`
- `/builds`
- `/methods`
- `/partners`
- `/about`

`/services` now serves the rebuilt canonical page. The obsolete `services.html` file was removed because it was taking precedence over the intended rewrite. The clean route remains canonical, and the explicit `.html` redirect remains in `vercel.json`.

## Sitemap

The production sitemap is live and contains the core commercial routes, proof and company routes, product estates, tools, diagnostics, University hubs, lessons, playbooks, templates, service pages, tool guides, and use cases.

No retained live page is to be removed, redirected, or noindexed solely because it is old, specialized, unfinished, or overlapping. Each route requires a substantive review and a documented decision.

## Next route-review tranche

1. `/practice`
2. `/ai-native-coo`
3. `/launch-stack`
4. `/engagements`
5. `/university/services`
6. `/university/services/*`
7. `/assessment` and `/university/assessment`
8. `/twins/console`

For each route, record:

- its distinct visitor and purpose;
- unique content or functionality;
- overlap with canonical routes;
- evidence, privacy, and professional-boundary risks;
- keep, revise, merge, redirect, noindex, archive, or remove decision;
- preservation destination for any unique material before a redirect or removal.
