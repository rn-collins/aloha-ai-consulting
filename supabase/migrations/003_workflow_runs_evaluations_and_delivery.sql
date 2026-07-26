create type public.run_status as enum ('queued','running','awaiting_review','approved','rejected','failed','completed','cancelled');
create type public.delivery_status as enum ('disabled','queued','attempting','succeeded','failed','cancelled');

create table public.twin_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  twin_id uuid not null references public.twins(id) on delete cascade,
  workflow_id uuid references public.workflows(id) on delete set null,
  status public.run_status not null default 'queued',
  input jsonb not null default '{}'::jsonb,
  input_hash text not null,
  policy_version text not null,
  definition_hash text,
  request_id text,
  created_by uuid not null references auth.users(id),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.run_steps (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.twin_runs(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  step_key text not null,
  position integer not null check (position >= 0),
  status public.run_status not null default 'queued',
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  error jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (run_id, step_key)
);

create table public.evaluations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  run_id uuid references public.twin_runs(id) on delete cascade,
  draft_id uuid references public.drafts(id) on delete cascade,
  evaluator_key text not null,
  evaluator_version text not null,
  score numeric(7,4),
  passed boolean,
  rationale text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.review_queue (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  run_id uuid references public.twin_runs(id) on delete cascade,
  draft_id uuid references public.drafts(id) on delete cascade,
  assigned_to uuid references auth.users(id) on delete set null,
  priority integer not null default 50 check (priority between 0 and 100),
  state text not null default 'open' check (state in ('open','in_review','resolved','cancelled')),
  due_at timestamptz,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  check (run_id is not null or draft_id is not null)
);

create table public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null,
  connection_name text not null,
  status text not null default 'disabled' check (status in ('disabled','configured','active','error','revoked')),
  scopes text[] not null default '{}',
  configuration jsonb not null default '{}'::jsonb,
  secret_reference text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, provider, connection_name)
);

create table public.delivery_attempts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  run_id uuid references public.twin_runs(id) on delete set null,
  draft_id uuid not null references public.drafts(id) on delete restrict,
  approval_id uuid not null references public.approvals(id) on delete restrict,
  connection_id uuid references public.integration_connections(id) on delete restrict,
  adapter_key text not null,
  destination jsonb not null,
  payload_hash text not null,
  idempotency_key text not null,
  status public.delivery_status not null default 'disabled',
  provider_response jsonb,
  error jsonb,
  attempted_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (organization_id, idempotency_key)
);

create index twin_runs_project_created_idx on public.twin_runs(project_id, created_at desc);
create index run_steps_run_position_idx on public.run_steps(run_id, position);
create index evaluations_run_idx on public.evaluations(run_id, created_at desc);
create index review_queue_org_state_idx on public.review_queue(organization_id, state, priority desc, created_at);
create index delivery_attempts_org_created_idx on public.delivery_attempts(organization_id, created_at desc);

alter table public.twin_runs enable row level security;
alter table public.run_steps enable row level security;
alter table public.evaluations enable row level security;
alter table public.review_queue enable row level security;
alter table public.integration_connections enable row level security;
alter table public.delivery_attempts enable row level security;

create policy twin_runs_select on public.twin_runs for select using (public.is_org_member(organization_id));
create policy twin_runs_insert on public.twin_runs for insert with check (public.has_org_role(organization_id, array['owner','admin','reviewer','operator']::public.platform_role[]) and created_by = auth.uid());
create policy twin_runs_update on public.twin_runs for update using (public.has_org_role(organization_id, array['owner','admin','reviewer','operator']::public.platform_role[]));

create policy run_steps_select on public.run_steps for select using (public.is_org_member(organization_id));
create policy run_steps_write on public.run_steps for all using (public.has_org_role(organization_id, array['owner','admin','operator']::public.platform_role[])) with check (public.has_org_role(organization_id, array['owner','admin','operator']::public.platform_role[]));

create policy evaluations_select on public.evaluations for select using (public.is_org_member(organization_id));
create policy evaluations_insert on public.evaluations for insert with check (public.has_org_role(organization_id, array['owner','admin','reviewer','operator']::public.platform_role[]));

create policy review_queue_select on public.review_queue for select using (public.is_org_member(organization_id));
create policy review_queue_manage on public.review_queue for all using (public.has_org_role(organization_id, array['owner','admin','reviewer']::public.platform_role[])) with check (public.has_org_role(organization_id, array['owner','admin','reviewer']::public.platform_role[]));

create policy integrations_select on public.integration_connections for select using (public.has_org_role(organization_id, array['owner','admin','operator']::public.platform_role[]));
create policy integrations_manage on public.integration_connections for all using (public.has_org_role(organization_id, array['owner','admin']::public.platform_role[])) with check (public.has_org_role(organization_id, array['owner','admin']::public.platform_role[]));

create policy delivery_select on public.delivery_attempts for select using (public.is_org_member(organization_id));
create policy delivery_insert on public.delivery_attempts for insert with check (public.has_org_role(organization_id, array['owner','admin','operator']::public.platform_role[]) and attempted_by = auth.uid());

revoke update, delete on public.evaluations from authenticated;
revoke update, delete on public.delivery_attempts from authenticated;
