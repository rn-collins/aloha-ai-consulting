# R07 Progress Report 08 — Security Assurance

Date: 2026-08-02

Status: passed within the documented checked-in repository and public-deployment boundary and verified in production; Unit 8 closed; R07 remains open

Frozen audit baseline: 4,289 promise records / 9,552 occurrences; unchanged

## Unit boundary

This unit evaluates the checked-in repository, public-site security headers, deployed platform-handler code, authentication defaults, client error boundary, secret-handling workflow, and responsible-disclosure path. It does not include penetration or denial-of-service testing; certify vulnerability absence; inspect Supabase database schema or row-level-security policies; or certify Vercel, GitHub, Microsoft, Supabase, client, satellite, personnel-access, logging, backup, or incident-response operations.

## Findings and disposition

The repository had a private-reporting policy and strong baseline headers, but the public reporting instruction was nonspecific. The deployed platform health handler disclosed which backend credential classes were configured. Shared API error handling could return provider/database messages and detail objects to clients. Platform configuration also required the Supabase service-role secret even though no checked-in handler invoked service-role access.

Disposition: passed-limited for the dated repository and public-deployment boundary after correction. No penetration-test, vulnerability-free, third-party, operational-account, database-policy, SOC 2, or ISO 27001 certification is granted.

## Implemented

- Published an explicit interim private vulnerability-reporting instruction through Microsoft Bookings using “security report — no meeting needed,” with safe-content limits and no authorization to access data or disrupt service.
- Removed backend credential-class enumeration from the public health response.
- Changed shared API errors to return bounded `request_failed` or `internal_error` codes without provider/database messages or detail objects.
- Removed the service-role credential from default platform requirements; service-role use now fails closed if a future caller explicitly requests it without configuration.
- Applied `Cache-Control: no-store` through the shared platform method gate and retained it on the health endpoint.
- Declared the `api/` and `lib/platform/` runtimes as CommonJS so Vercel can execute the checked-in CommonJS handlers and platform libraries under the repository's ESM root package.
- Confirmed that public sign-up and sign-in fail closed unless explicitly enabled, 11 platform handlers require a valid session, and model and external-delivery adapters remain disabled.
- Confirmed that checked-in handlers make zero service-role calls; Supabase row-level security remains an explicit unverified authorization dependency.
- Added a release-blocking 13-check security evaluator, canonical evidence record, public API evidence record, assurance-manifest integration, and regression assertions.

## Automated results

- 14/14 bounded security-assurance checks passed.
- 16 platform handlers inventoried; 11 require authenticated sessions.
- Zero checked-in service-role callers, environment files, or configured secret-pattern hits found by the repository evaluator.
- Full-history Gitleaks workflow remains configured for pull requests, `main` pushes, weekly schedule, and manual dispatch.
- Production dependency audit reported zero known vulnerabilities across the installed dependency graph at review time.
- 2/7 site-assurance domains now have bounded evaluation decisions; five remain required and unevaluated.
- 105/105 repository tests passed.
- 497 sitemap HTML pages plus recovery, 9,627 interactions, shared actions, and presentation QA passed.
- Current promise release registry reconciled at 5,255 records / 11,833 occurrences.
- Frozen 4,289/9,552 audit baseline preserved.

## Remaining limitations

- Supabase row-level-security and database policies were not available in this repository and must be inspected before public authentication or platform availability is enabled.
- GitHub, Vercel, Microsoft, and Supabase account permissions, MFA, audit logs, retention, backups, and incident operations require separate owner/provider review.
- The CSP permits inline scripts/styles because the current generated estate depends on them; moving to nonces or hashes remains future hardening, not a condition represented as complete here.
- Static inspection and pattern scanning cannot establish vulnerability absence or replace independent authorized testing.
- The interim disclosure path depends on Microsoft Bookings and should be replaced by a brand-owned private channel before the authenticated platform is activated.

## Production verification

PASS within the stated boundary. GitHub `main` evaluation commit `67e33ec9e36cf462ba46bf82317c791e3f903cc9`, whose remote tree exactly matched the locally tested tree, deployed through Vercel production deployment `dpl_6V7eHe44Emnaf8mW4vLJZXX6ApWm`. Live verification exposed CommonJS/ESM runtime failures in the deployed platform handlers. Corrective commits `d9410a6e928b734f24eb725e3ea84d74bbe1f611` and `b919b5ef7ff839425cc8638408f0e3e9f0ae8123`, each published with remote tree equality, deployed through `dpl_6MoQLCSqdDPaCy2RwaxFsGh26czs` and final production deployment `dpl_Di4e1PruijPa46BV68tPmNVZsx7W`.

Production verification established:

- The final deployment reached `READY`, targeted production, and Vercel metadata identified exact GitHub commit `b919b5ef7ff839425cc8638408f0e3e9f0ae8123`.
- `/privacy`, `/api/evaluations/security.json`, and `/api/assurance-manifest.json` returned HTTP 200 from the canonical domain.
- The live privacy page publishes the private “security report — no meeting needed” instruction and safe-reporting boundary.
- The live security evaluation reports 14 checks, 14 passes, zero failures, 16 platform handlers, 11 session-gated handlers, zero service-role callers, zero tracked environment files, and zero checked-tree secret hits.
- The live assurance manifest reports two boundedly evaluated site-assurance domains, five remaining required domains, zero certified domains, and zero errors.
- `/api/platform/health` executes and returns deliberate HTTP 503 with `Cache-Control: no-store`, `authenticatedPlatform: unavailable`, and no backend credential-class enumeration.
- Public auth handlers execute and reject unsupported GET requests with bounded HTTP 405 JSON and `Cache-Control: no-store` rather than crashing.
- `/api/platform/ai/generate` executes and rejects unsupported GET requests with bounded HTTP 405 JSON and `Cache-Control: no-store`; external model execution remains disabled for POST processing.
- Live responses include CSP, HSTS, `nosniff`, frame denial, referrer policy, and permissions policy headers.
- The live record preserves the explicit non-certification boundary for penetration testing, vulnerability absence, third-party systems, operational accounts, and Supabase row-level security.

R07 Unit 8 is closed.

R07 remains open for five evidence-producing site-assurance domains: accessibility, corrections, legal authority, rights and attribution, and institutional credentials.

Verifier: Codex remediation agent

Retest trigger: any API handler, authentication, authorization, cookie, secret, environment, logging, error, CSP/header, dependency, workflow, disclosure-path, database-policy, assurance-schema, or deployment change; otherwise 2026-11-02.
