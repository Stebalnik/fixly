-- Fixly Supabase migration
-- Created: 2026-05-21T02:20:30Z
-- Purpose: Track autonomous SEO growth orchestration runs.
-- Safety: Adds logging table only; no routing, pricing, or content behavior changes.
-- Rollback notes: Drop public.seo_growth_orchestration_runs if orchestration logging is removed.

create table if not exists public.seo_growth_orchestration_runs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'running',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  duration_ms integer,
  opportunities_discovered integer not null default 0,
  opportunities_prioritized integer not null default 0,
  opportunities_deduplicated integer not null default 0,
  drafts_created integer not null default 0,
  pages_reviewed integer not null default 0,
  pages_rejected integer not null default 0,
  pages_published integer not null default 0,
  reasons jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint seo_growth_orchestration_runs_status_allowed
    check (status in ('running', 'completed', 'failed'))
);

create index if not exists idx_seo_growth_orchestration_runs_status_started
  on public.seo_growth_orchestration_runs (status, started_at desc);

alter table public.seo_growth_orchestration_runs enable row level security;
