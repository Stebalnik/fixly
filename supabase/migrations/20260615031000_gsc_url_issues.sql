-- Fixly Supabase migration
-- Created: 2026-06-15T03:10:00Z
-- Purpose: Track Google Search Console URL/indexing issues and agent-proposed fixes.
-- Safety: Adds a logging/action table only; no routing, pricing, or content behavior changes.
-- Rollback notes: Drop public.gsc_url_issues if this audit workflow is removed.

create table if not exists public.gsc_url_issues (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  path text not null,
  source text not null default 'unknown',
  issue_type text not null,
  severity text not null default 'medium',
  status text not null default 'open',
  http_status integer,
  final_url text,
  gsc_verdict text,
  gsc_coverage_state text,
  gsc_page_fetch_state text,
  country_code text,
  region_slug text,
  market_slug text,
  category_slug text,
  subcategory_slug text,
  intent_slug text,
  recommendation text not null,
  proposed_action jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  opportunity_id uuid,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gsc_url_issues_status_allowed
    check (status in ('open', 'opportunity_created', 'resolved', 'ignored')),
  constraint gsc_url_issues_severity_allowed
    check (severity in ('low', 'medium', 'high', 'critical'))
);

create unique index if not exists idx_gsc_url_issues_url_issue_type
  on public.gsc_url_issues (url, issue_type);

create index if not exists idx_gsc_url_issues_status_last_seen
  on public.gsc_url_issues (status, last_seen_at desc);

create index if not exists idx_gsc_url_issues_issue_type_last_seen
  on public.gsc_url_issues (issue_type, last_seen_at desc);

create index if not exists idx_gsc_url_issues_market_service
  on public.gsc_url_issues (
    country_code,
    market_slug,
    category_slug,
    subcategory_slug,
    intent_slug
  );

alter table public.gsc_url_issues enable row level security;
