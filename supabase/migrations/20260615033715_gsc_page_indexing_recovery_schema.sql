-- Fixly Supabase migration
-- Created: 2026-06-15T03:37:15Z
-- Purpose: Upgrade GSC URL issue tracking for Page Indexing import/recovery workflows.
-- Safety: Adds nullable metadata columns, backfills from existing issue rows, and changes
--         proposed_action from JSON payload storage to the requested text action name while
--         preserving the old JSON details in action_payload.
-- DESTRUCTIVE_CHANGE_APPROVED
-- Rollback notes: Drop the added columns/indexes only if the GSC recovery workflow is removed.

alter table public.gsc_url_issues
  add column if not exists normalized_url text,
  add column if not exists gsc_reason text,
  add column if not exists normalized_reason text default 'unknown',
  add column if not exists root_cause text,
  add column if not exists inspection_index_status text,
  add column if not exists inspection_coverage_state text,
  add column if not exists canonical_user text,
  add column if not exists canonical_google text,
  add column if not exists action_payload jsonb not null default '{}'::jsonb;

alter table public.gsc_url_issues
  alter column source set default 'gsc_page_indexing_import';

update public.gsc_url_issues
set
  normalized_url = coalesce(normalized_url, url),
  normalized_reason = case
    when normalized_reason is not null and normalized_reason <> 'unknown' then normalized_reason
    else
    case
      when issue_type in ('missing_market', 'missing_service_route', 'invalid_intent', 'http_404', 'google_not_found') then 'not_found_404'
      when issue_type in ('http_5xx', 'google_server_error') then 'server_error_5xx'
      when issue_type in ('page_with_redirect') then 'page_with_redirect'
      when issue_type in ('redirect_error') then 'redirect_error'
      when issue_type in ('duplicate_without_user_canonical') then 'duplicate_without_user_canonical'
      when issue_type in ('duplicate_google_canonical_mismatch') then 'duplicate_google_chose_different_canonical'
      when issue_type in ('alternate_canonical') then 'alternate_page_with_canonical'
      when issue_type in ('noindex') then 'noindex'
      when issue_type in ('crawled_not_indexed') then 'crawled_currently_not_indexed'
      when issue_type in ('discovered_not_indexed') then 'discovered_currently_not_indexed'
      else 'unknown'
    end
  end,
  root_cause = coalesce(root_cause, issue_type),
  gsc_reason = coalesce(gsc_reason, gsc_coverage_state),
  inspection_index_status = coalesce(inspection_index_status, gsc_verdict),
  inspection_coverage_state = coalesce(inspection_coverage_state, gsc_coverage_state);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'gsc_url_issues'
      and column_name = 'proposed_action'
      and data_type = 'jsonb'
  ) then
    update public.gsc_url_issues
    set action_payload = case
      when action_payload = '{}'::jsonb then proposed_action
      else action_payload
    end;

    alter table public.gsc_url_issues
      alter column proposed_action drop default,
      alter column proposed_action drop not null;

    alter table public.gsc_url_issues
      alter column proposed_action type text
      using nullif(coalesce(proposed_action->>'action', proposed_action::text), '{}');
  end if;
end $$;

update public.gsc_url_issues
set normalized_url = url
where normalized_url is null or btrim(normalized_url) = '';

update public.gsc_url_issues
set normalized_reason = 'unknown'
where normalized_reason is null or btrim(normalized_reason) = '';

alter table public.gsc_url_issues
  alter column normalized_url set not null,
  alter column normalized_reason set not null;

drop index if exists public.idx_gsc_url_issues_url_issue_type;

create unique index if not exists idx_gsc_url_issues_normalized_url_reason
  on public.gsc_url_issues (normalized_url, normalized_reason);

create index if not exists idx_gsc_url_issues_status
  on public.gsc_url_issues (status);

create index if not exists idx_gsc_url_issues_root_cause
  on public.gsc_url_issues (root_cause);

create index if not exists idx_gsc_url_issues_issue_type
  on public.gsc_url_issues (issue_type);

create index if not exists idx_gsc_url_issues_normalized_reason
  on public.gsc_url_issues (normalized_reason);

create index if not exists idx_gsc_url_issues_last_seen_desc
  on public.gsc_url_issues (last_seen_at desc);
