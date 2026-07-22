# Aloha AI

Aloha AI is a neuroscience-informed AI strategy, regulatory-intelligence, and implementation practice for regulated or reputation-sensitive organizations. This repository contains the public website and browser-based tools for the practice.

## Status

- **Production site:** `https://aloha-ai-consulting.vercel.app`
- **Deployment:** static site on Vercel from `main`
- **Owner:** Rayven-Nikkita Collins LLC, operating as Aloha AI
- **Public-use boundary:** informational and operational tools only; no legal, tax, medical, or investment advice

## What this repository contains

The site includes the main practice website, service pages, Aloha AI University materials, browser-based assessment and policy tools, regulatory-intelligence explainers, and links to separately deployed monitoring systems.

## Architecture

This is primarily a static HTML/CSS/JavaScript repository. Vercel provides clean URLs, caching, HTTPS, and response headers through `vercel.json`.

```text
.
├── index.html
├── about.html
├── privacy.html
├── terms.html
├── aloha-ds.css
├── tools/
├── university/
├── intelligence/
├── monitors/
├── systems/
├── teardowns/
├── docs/
├── scripts/
├── vercel.json
└── .github/workflows/
```

## Local development

No application build is required for the static pages. Serve the repository through a local web server:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Data and environment handling

The public repository is designed not to require production secrets. Browser-only tools should not transmit user-entered values unless a page explicitly discloses a server-side or third-party data flow. See:

- `docs/public-claims-and-data-governance.md`
- `.env.example`
- `SECURITY.md`

## Evidence and claims

Public claims about credentials, services, tool behavior, privacy, regulatory coverage, and source verification must be supported in `docs/public-claims-and-data-governance.md`. Material changes should update the register in the same pull request.

## Third-party assets and services

See `docs/public-claims-and-data-governance.md` for the current inventory and review requirements. External services may include Vercel, Microsoft Outlook Bookings, Google Fonts, LinkedIn, and separately deployed Aloha AI tools.

## Release controls

Pull requests and scheduled workflows run:

- full-history secret scanning;
- deterministic internal-link validation;
- non-blocking external-link reporting;
- public-claim and documentation checks.

## Limitations

- A successful scanner run does not prove that no credential exists in an external dashboard or unconnected system.
- Regulatory and legal information may become stale and must be verified against primary sources.
- Linked satellite tools may have separate repositories, privacy behavior, and maintenance status.
- Publication in this repository does not create a professional-client or attorney-client relationship.

## Rights

Unless a file states otherwise, repository content is owned by Rayven-Nikkita Collins LLC. Third-party marks, quotations, screenshots, datasets, and linked materials remain subject to their respective owners’ rights and terms.