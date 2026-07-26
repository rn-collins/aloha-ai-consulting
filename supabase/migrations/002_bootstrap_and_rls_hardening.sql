-- Platform bootstrap and role-aware RLS hardening.

create or replace function public.bootstrap_workspace(
  organization_name text,
  organization_slug text,
  project_name text default 'Trust-Safe Twin Workspace',
  project_slug text default 'trust-safe-twin'
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  org public.organizations;
  project public.projects;
begin
  if uid is null then raise exception 'authentication required'; end if;
  if exists(select 1 from public.organization_memberships where user_id = uid) then
    raise exception 'workspace already exists for this user';
  end if;

  insert into public.organizations(name, slug, created_by)
  values (organization_name, organization_slug, uid)
  returning * into org;

  insert into public.organization_memberships(organization_id, user_id, role)
  values (org.id, uid, 'owner');

  insert into public.projects(organization_id, name, slug, created_by)
  values (org.id, project_name, project_slug, uid)
  returning * into project;

  insert into public.twins(organization_id, project_id, name, twin_type, status, created_by)
  values (org.id, project.id, 'Trust-Safe Sales Twin', 'sales', 'active', uid);

  insert into public.audit_events(organization_id, project_id, actor_id, event_type, entity_type, entity_id, payload)
  values (org.id, project.id, uid, 'workspace.bootstrapped', 'organization', org.id,
    jsonb_build_object('organization_name', org.name, 'project_name', project.name));

  return jsonb_build_object('organization', to_jsonb(org), 'project', to_jsonb(project));
end;
$$;

grant execute on function public.bootstrap_workspace(text,text,text,text) to authenticated;

-- Replace broad member-write policies with role-aware policies.
drop policy if exists projects_member_all on public.projects;
drop policy if exists twins_member_all on public.twins;
drop policy if exists workflows_member_all on public.workflows;
drop policy if exists sources_member_all on public.sources;
drop policy if exists drafts_member_all on public.drafts;
drop policy if exists evidence_member_all on public.draft_evidence;
drop policy if exists guardrails_member_all on public.guardrail_results;

create policy projects_select on public.projects for select using (public.is_org_member(organization_id));
create policy projects_write on public.projects for all
  using (public.has_org_role(organization_id, array['owner','admin','operator']::public.platform_role[]))
  with check (public.has_org_role(organization_id, array['owner','admin','operator']::public.platform_role[]));

create policy twins_select on public.twins for select using (public.is_org_member(organization_id));
create policy twins_write on public.twins for all
  using (public.has_org_role(organization_id, array['owner','admin','operator']::public.platform_role[]))
  with check (public.has_org_role(organization_id, array['owner','admin','operator']::public.platform_role[]));

create policy workflows_select on public.workflows for select using (public.is_org_member(organization_id));
create policy workflows_write on public.workflows for all
  using (public.has_org_role(organization_id, array['owner','admin','operator']::public.platform_role[]))
  with check (public.has_org_role(organization_id, array['owner','admin','operator']::public.platform_role[]));

create policy sources_select on public.sources for select using (public.is_org_member(organization_id));
create policy sources_write on public.sources for all
  using (public.has_org_role(organization_id, array['owner','admin','operator']::public.platform_role[]))
  with check (public.has_org_role(organization_id, array['owner','admin','operator']::public.platform_role[]));

create policy drafts_select on public.drafts for select using (public.is_org_member(organization_id));
create policy drafts_write on public.drafts for all
  using (public.has_org_role(organization_id, array['owner','admin','reviewer','operator']::public.platform_role[]))
  with check (public.has_org_role(organization_id, array['owner','admin','reviewer','operator']::public.platform_role[]));

create policy evidence_select on public.draft_evidence for select using (
  exists(select 1 from public.drafts d where d.id = draft_id and public.is_org_member(d.organization_id))
);
create policy evidence_write on public.draft_evidence for all using (
  exists(select 1 from public.drafts d where d.id = draft_id and public.has_org_role(d.organization_id, array['owner','admin','operator']::public.platform_role[]))
) with check (
  exists(select 1 from public.drafts d where d.id = draft_id and public.has_org_role(d.organization_id, array['owner','admin','operator']::public.platform_role[]))
);

create policy guardrails_select on public.guardrail_results for select using (public.is_org_member(organization_id));
create policy guardrails_insert on public.guardrail_results for insert with check (
  public.has_org_role(organization_id, array['owner','admin','reviewer','operator']::public.platform_role[])
);

-- Immutable records stay insert/select only.
revoke all on public.audit_events from anon;
revoke all on public.approvals from anon;
revoke all on public.guardrail_results from anon;
grant select, insert on public.audit_events to authenticated;
grant select, insert on public.approvals to authenticated;
grant select, insert on public.guardrail_results to authenticated;
