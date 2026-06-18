-- Fixly Supabase migration
-- Created: 2026-06-18T17:35:00Z
-- Purpose: Add a generic platform event stream for admin analytics across accounts, requests, payments, leads, messages, and marketplace actions.
-- Safety: Additive table/indexes only; no existing data is modified.
-- Rollback notes: Drop platform_events if this event stream is replaced.

create table if not exists public.platform_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  event_group text not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  entity_type text,
  entity_id text,
  source text not null default 'server',
  country_code text,
  state text,
  market_slug text,
  category_slug text,
  subcategory_slug text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint platform_events_event_name_check
    check (length(btrim(event_name)) > 0),
  constraint platform_events_event_group_check
    check (length(btrim(event_group)) > 0)
);

create index if not exists platform_events_created_at_idx
  on public.platform_events (created_at desc);

create index if not exists platform_events_group_created_at_idx
  on public.platform_events (event_group, created_at desc);

create index if not exists platform_events_name_created_at_idx
  on public.platform_events (event_name, created_at desc);

create index if not exists platform_events_actor_created_at_idx
  on public.platform_events (actor_user_id, created_at desc)
  where actor_user_id is not null;

create index if not exists platform_events_country_created_at_idx
  on public.platform_events (country_code, created_at desc)
  where country_code is not null;

create index if not exists platform_events_entity_idx
  on public.platform_events (entity_type, entity_id)
  where entity_type is not null and entity_id is not null;

alter table public.platform_events enable row level security;
