# Public Claims and Data Governance

## Purpose

This document is the release gate for factual, professional, regulatory, technical, privacy, and performance claims made by the Aloha AI site and its public tools.

## Claim classes

| Class | Required support |
|---|---|
| Identity and credentials | Current CV, credential, institutional record, or owner confirmation |
| Corporate and brand status | Formation or DBA record and current operating facts |
| Technical behavior | Current code, architecture, test, or deployment evidence |
| Privacy behavior | Route-by-route inspection of scripts, forms, network calls, storage, analytics, and third parties |
| Regulatory or legal fact | Primary authority with jurisdiction and last-verified date |
| Quantitative or performance claim | Reproducible method, source data, assumptions, and date |
| Client or outcome claim | Written permission and substantiating record |

## Current high-priority claims

The following claims require continuous verification before material publication changes:

1. Aloha AI is a DBA or operating brand of Rayven-Nikkita Collins LLC.
2. RN Collins's degrees, JD-candidate status, roles, and professional descriptions are current and accurately framed.
3. Public tools run locally in the browser unless a page expressly documents another data flow.
4. The site uses no tracking, cookies, or analytics.
5. Regulatory-intelligence tools rely on identified sources and state when records were last verified.
6. Service descriptions do not imply legal representation, guaranteed outcomes, or professional licensure that does not exist.
7. Named tool counts, page counts, resource counts, and coverage claims match the deployed site.

## Privacy and data-flow register

### First-party static pages

Expected behavior: HTML, CSS, JavaScript, images, and fonts are delivered to the visitor. Browser-only calculations should remain on the device.

### Vercel

Vercel hosts the site and may process ordinary server and security logs under its own platform terms. Repository language should not imply that hosting produces literally no operational metadata.

### Microsoft Outlook Bookings

Booking links send visitors to Microsoft. Information entered there is processed by Microsoft and delivered to the practice owner.

### Email and LinkedIn

Email and LinkedIn links transfer the visitor to those providers. Their privacy practices apply.

### Google Fonts

Where externally hosted Google Fonts are used, the visitor's browser may contact Google infrastructure. This must be considered when making a blanket 'no third parties load' statement.

### Satellite tools

Linked tools on other Vercel deployments or repositories require separate inspection. This repository cannot certify their data behavior merely by linking to them.

## Current privacy discrepancy requiring correction

`privacy.html` states that there is no analytics and that no third-party trackers load. The current `vercel.json` Content Security Policy permits Google Analytics, Google Tag Manager, Vercel Analytics, and Speed Insights endpoints. Permission in a CSP is not proof that those scripts execute, but the mismatch must be resolved by either:

- removing unused analytics permissions from the CSP; or
- updating the privacy notice and implementation to accurately disclose active services.

No release should claim verified privacy behavior until the deployed network activity and every public route have been checked.

## Third-party assets and rights register

Review and record the source and permitted use of:

- logos, icons, illustrations, screenshots, and social images;
- Google Fonts and any bundled font files;
- quotations and copied descriptions;
- regulatory, legal, scientific, and market datasets;
- embedded or linked PDFs;
- institutional names and marks;
- client, prospect, publication, or collaborator references.

A link is not a license. Public-domain status, fair-use reasoning, open-license terms, or written permission should be recorded where relevant.

## Source record minimum

Every material regulatory or quantitative record should support:

```json
{
  "claim": "",
  "source_title": "",
  "source_url": "",
  "authority_type": "primary|secondary|owner-record",
  "jurisdiction": "",
  "last_verified": "YYYY-MM-DD",
  "reviewer": "",
  "notes": ""
}
```

## Release decision

A change is not publication-ready when it introduces an unsupported credential, client result, legal conclusion, privacy promise, automated-system claim, or numerical assertion. Uncertainty and limitations should be stated rather than hidden.