-- Fixly Supabase migration
-- Created: 2026-06-18T18:15:00Z
-- Purpose: Track real customer request submissions and Stripe checkout attempts for operational analytics.
-- Safety: Additive tables/indexes only; no existing data is modified.
-- Rollback notes: Drop customer_request_events and payment_checkout_attempts if this tracking is no longer needed.

create table if not exists public.customer_request_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  event_type text not null default 'request_created',
  source text not null default 'web_form',
  market_slug text,
  city text,
  state text,
  country_code text,
  category_slug text,
  subcategory_slug text,
  customer_flow text,
  referrer text,
  origin text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint customer_request_events_event_type_check
    check (event_type in ('request_created')),
  constraint customer_request_events_source_check
    check (source in ('web_form', 'admin', 'internal'))
);

create unique index if not exists customer_request_events_request_event_source_key
  on public.customer_request_events (request_id, event_type, source);

create index if not exists customer_request_events_created_at_idx
  on public.customer_request_events (created_at desc);

create index if not exists customer_request_events_state_created_at_idx
  on public.customer_request_events (state, created_at desc);

alter table public.customer_request_events enable row level security;

create table if not exists public.payment_checkout_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  stripe_session_id text not null unique,
  checkout_source text not null default 'account_fixa_buy',
  status text not null default 'created',
  stripe_status text,
  payment_status text,
  currency text,
  amount_total integer,
  fixa_amount integer,
  price_cents integer,
  customer_email text,
  created_at timestamptz not null default now(),
  stripe_created_at timestamptz,
  expires_at timestamptz,
  completed_at timestamptz,
  expired_at timestamptz,
  last_event_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint payment_checkout_attempts_status_check
    check (status in ('created', 'completed', 'expired', 'async_payment_failed', 'unpaid_completed'))
);

create index if not exists payment_checkout_attempts_created_at_idx
  on public.payment_checkout_attempts (stripe_created_at desc nulls last, created_at desc);

create index if not exists payment_checkout_attempts_source_status_idx
  on public.payment_checkout_attempts (checkout_source, status);

create index if not exists payment_checkout_attempts_user_created_at_idx
  on public.payment_checkout_attempts (user_id, stripe_created_at desc nulls last, created_at desc);

alter table public.payment_checkout_attempts enable row level security;
