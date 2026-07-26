# Aloha AI Platform Architecture v1

## Purpose

The public website remains the discovery and demonstration layer. Production workflows run through authenticated, organization-scoped services with persistent evidence, approvals, and append-only audit events.

## Runtime boundaries

### Public lab

- Anonymous access.
- Browser-local sample data and CSV parsing.
- Deterministic demonstrations.
- No secret keys.
- No external sending.
- No persistent storage unless a visitor explicitly enters an authenticated workspace.

### Authenticated platform

- Users belong to organizations through memberships.
- Organizations own projects, twins, workflows, sources, drafts, approvals, and audit events.
- Server-side APIs enforce authorization.
- External actions require a persisted approval decision.
- Model providers and integrations are reached only through server-side adapters.

## Core layers

1. Presentation: website, public lab, workspace, review queue, evidence explorer, administration.
2. Identity: Supabase Auth identities, sessions, invitations, and organization membership.
3. Authorization: organization-scoped roles and row-level security.
4. Data: PostgreSQL for structured records and append-only events.
5. Files: private object storage for documents and exports.
6. Retrieval: source chunks and embeddings, with citations back to immutable source versions.
7. AI gateway: provider-neutral generation requests, model policy, usage accounting, guardrails, and evaluation.
8. Human review: draft, screen, edit, approve or reject, then deliver.
9. Integrations: adapter contracts for CRM, email, documents, calendar, and messaging systems.
10. Observability: request IDs, audit events, failure reasons, latency, model usage, and delivery status.

## Trust contract

No production side effect may occur unless all of the following are true:

- the actor has access to the organization and project;
- the workflow is active and versioned;
- required evidence is present;
- guardrails have completed;
- no blocking guardrail remains unresolved;
- an authorized human has approved the exact content version;
- the delivery adapter receives an idempotency key;
- an audit event is written for the attempt and result.

## Initial implementation

The first production tranche establishes:

- organization and membership tables;
- project, twin, workflow, source, draft, approval, guardrail, and audit-event tables;
- row-level security policies;
- a server-side platform health endpoint;
- a public platform shell showing live infrastructure readiness;
- environment-variable contracts for Supabase-backed persistence.

## Required Vercel environment variables

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PLATFORM_ENV` (`development`, `preview`, or `production`)

The service-role key must never be exposed to browser code.

## Next production tranches

1. Apply the database migration and verify row-level security.
2. Add Supabase Auth sign-in, session handling, and invitation acceptance.
3. Build organization and project creation APIs.
4. Persist drafts, guardrail results, evidence links, and approval decisions.
5. Add the provider-neutral AI gateway.
6. Add the first delivery adapter with idempotency and a mandatory approval gate.
7. Reconnect the public Twins lab to an authenticated workspace handoff without changing its anonymous local behavior.
