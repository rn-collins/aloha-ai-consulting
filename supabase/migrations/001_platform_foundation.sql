create extension if not exists pgcrypto;

create type public.platform_role as enum ('owner','admin','reviewer','operator','viewer');
create type public.record_status as enum ('draft','active','paused','archived');
create type public.review_decision as enum ('approved','rejected','changes_requested');
create type public.guardrail_outcome as enum ('pass','warn','block');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,62}$'),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_memberships (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.platform_role not null default 'viewer',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  status public.record_status not null default 'active',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table public.twins (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  twin_type text not null,
  status public.record_status not null default 'draft',
  policy_version text not null default 'v1',
  configuration jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workflows (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  twin_id uuid references public.twins(id) on delete set null,
  name text not null,
  version integer not null default 1 check (version > 0),
  status public.record_status not null default 'draft',
  definition jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (project_id, name, version)
);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  source_type text not null,
  title text not null,
  uri text,
  content_hash text not null,
  version integer not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (project_id, content_hash, version)
);

create table public.drafts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  workflow_id uuid references public.workflows(id) on delete set null,
  twin_id uuid references public.twins(id) on delete set null,
  content text not null,
  content_hash text not null,
  status text not null default 'awaiting_review',
  model_provider text,
  model_name text,
  model_request_id text,
  prompt_version text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.draft_evidence (
  draft_id uuid not null references public.drafts(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete restrict,
  claim_key text not null,
  excerpt text,
  confidence numeric(5,4) check (confidence between 0 and 1),
  created_at timestamptz not null default now(),
  primary key (draft_id, source_id, claim_key)
);

create table public.guardrail_results (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  draft_id uuid not null references public.drafts(id) on delete cascade,
  guardrail_key text not null,
  outcome public.guardrail_outcome not null,
  reason text not null,
  details jsonb not null default '{}'::jsonb,
  policy_version text not null,
  created_at timestamptz not null default now()
);

create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  draft_id uuid not null references public.drafts(id) on delete restrict,
  draft_content_hash text not null,
  decision public.review_decision not null,
  reviewer_id uuid not null references auth.users(id),
  note text,
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  request_id text,
  idempotency_key text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index audit_events_idempotency_unique
  on public.audit_events (organization_id, idempotency_key)
  where idempotency_key is not null;
create index memberships_user_idx on public.organization_memberships(user_id);
create index projects_org_idx on public.projects(organization_id);
create index drafts_project_idx on public.drafts(project_id, created_at desc);
create index guardrails_draft_idx on public.guardrail_results(draft_id);
create index approvals_draft_idx on public.approvals(draft_id, created_at desc);
create index audit_org_created_idx on public.audit_events(organization_id, created_at desc);

create or replace function public.is_org_member(target_org uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (
  select 1 from public.organization_memberships m
  where m.organization_id = target_org and m.user_id = auth.uid()
); $$;

create or replace function public.has_org_role(target_org uuid, allowed public.platform_role[])
returns boolean language sql stable security definer set search_path = public
as $$ select exists (
  select 1 from public.organization_memberships m
  where m.organization_id = target_org and m.user_id = auth.uid() and m.role = any(allowed)
); $$;

alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.projects enable row level security;
alter table public.twins enable row level security;
alter table public.workflows enable row level security;
alter table public.sources enable row level security;
alter table public.drafts enable row level security;
alter table public.draft_evidence enable row level security;
alter table public.guardrail_results enable row level security;
alter table public.approvals enable row level security;
alter table public.audit_events enable row level security;

create policy organizations_select on public.organizations for select using (public.is_org_member(id));
create policy organizations_update on public.organizations for update using (public.has_org_role(id, array['owner','admin']::public.platform_role[]));
create policy memberships_select on public.organization_memberships for select using (public.is_org_member(organization_id));
create policy memberships_manage on public.organization_memberships for all using (public.has_org_role(organization_id, array['owner','admin']::public.platform_role[])) with check (public.has_org_role(organization_id, array['owner','admin']::public.platform_role[]));

create policy projects_member_all on public.projects for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy twins_member_all on public.twins for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy workflows_member_all on public.workflows for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy sources_member_all on public.sources for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy drafts_member_all on public.drafts for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy evidence_member_all on public.draft_evidence for all using (exists (select 1 from public.drafts d where d.id = draft_id and public.is_org_member(d.organization_id))) with check (exists (select 1 from public.drafts d where d.id = draft_id and public.is_org_member(d.organization_id)));
create policy guardrails_member_all on public.guardrail_results for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy approvals_select on public.approvals for select using (public.is_org_member(organization_id));
create policy approvals_insert on public.approvals for insert with check (public.has_org_role(organization_id, array['owner','admin','reviewer']::public.platform_role[]) and reviewer_id = auth.uid());
create policy audit_select on public.audit_events for select using (public.is_org_member(organization_id));

revoke update, delete on public.audit_events from authenticated;
revoke update, delete on public.approvals from authenticated;
revoke update, delete on public.guardrail_results from authenticated;
