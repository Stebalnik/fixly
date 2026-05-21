-- Fixly Supabase migration
-- Created: 2026-05-21T02:33:53Z
-- Purpose: Add marketplace trust, reputation, reviews, and ranking support.
-- Safety: Additive schema changes only; no routing or pricing changes.
-- Rollback notes: Drop new review/ranking tables and added profile columns if this layer is removed.
-- DESTRUCTIVE_CHANGE_APPROVED

alter table public.pro_profiles
  add column if not exists slug text,
  add column if not exists avatar_url text,
  add column if not exists logo_url text,
  add column if not exists bio text,
  add column if not exists years_experience integer,
  add column if not exists service_categories text[] not null default '{}',
  add column if not exists service_areas text[] not null default '{}',
  add column if not exists licenses jsonb not null default '[]'::jsonb,
  add column if not exists insurance_verified boolean not null default false,
  add column if not exists portfolio_images jsonb not null default '[]'::jsonb,
  add column if not exists verification_status text not null default 'unverified',
  add column if not exists average_response_minutes integer,
  add column if not exists completed_jobs_count integer not null default 0,
  add column if not exists repeat_customers_count integer not null default 0,
  add column if not exists unlocked_leads_count integer not null default 0,
  add column if not exists lead_response_count integer not null default 0,
  add column if not exists rating_summary jsonb not null default '{"average":0,"count":0}'::jsonb,
  add column if not exists public_profile_enabled boolean not null default true;

update public.pro_profiles
set slug = lower(regexp_replace(coalesce(nullif(company_name, ''), nullif(full_name, ''), user_id::text), '[^a-z0-9]+', '-', 'g'))
where slug is null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'pro_profiles_years_experience_nonnegative'
      and conrelid = 'public.pro_profiles'::regclass
  ) then
    alter table public.pro_profiles
      add constraint pro_profiles_years_experience_nonnegative
      check (years_experience is null or years_experience >= 0)
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'pro_profiles_completed_jobs_nonnegative'
      and conrelid = 'public.pro_profiles'::regclass
  ) then
    alter table public.pro_profiles
      add constraint pro_profiles_completed_jobs_nonnegative
      check (completed_jobs_count >= 0)
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'pro_profiles_response_minutes_nonnegative'
      and conrelid = 'public.pro_profiles'::regclass
  ) then
    alter table public.pro_profiles
      add constraint pro_profiles_response_minutes_nonnegative
      check (average_response_minutes is null or average_response_minutes >= 0)
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'pro_profiles_verification_status_allowed'
      and conrelid = 'public.pro_profiles'::regclass
  ) then
    alter table public.pro_profiles
      add constraint pro_profiles_verification_status_allowed
      check (verification_status in ('unverified', 'pending', 'verified', 'rejected'))
      not valid;
  end if;
end;
$$;

create unique index if not exists pro_profiles_slug_key
  on public.pro_profiles (slug)
  where slug is not null;

create index if not exists idx_pro_profiles_public_status
  on public.pro_profiles (status, public_profile_enabled, verification_status);

create table if not exists public.pro_reviews (
  id uuid primary key default gen_random_uuid(),
  pro_user_id uuid not null references public.pro_profiles(user_id) on delete cascade,
  customer_user_id uuid references auth.users(id) on delete set null,
  request_id uuid references public.service_requests(id) on delete set null,
  rating integer not null,
  quality_rating integer,
  communication_rating integer,
  value_rating integer,
  punctuality_rating integer,
  review_title text,
  review_body text,
  verified boolean not null default false,
  moderation_status text not null default 'pending',
  moderation_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pro_reviews_rating_range check (rating between 1 and 5),
  constraint pro_reviews_quality_rating_range check (quality_rating is null or quality_rating between 1 and 5),
  constraint pro_reviews_communication_rating_range check (communication_rating is null or communication_rating between 1 and 5),
  constraint pro_reviews_value_rating_range check (value_rating is null or value_rating between 1 and 5),
  constraint pro_reviews_punctuality_rating_range check (punctuality_rating is null or punctuality_rating between 1 and 5),
  constraint pro_reviews_moderation_status_allowed check (moderation_status in ('pending', 'approved', 'rejected', 'hidden'))
);

create unique index if not exists pro_reviews_request_customer_pro_key
  on public.pro_reviews (request_id, customer_user_id, pro_user_id)
  where request_id is not null and customer_user_id is not null;

create index if not exists idx_pro_reviews_public
  on public.pro_reviews (pro_user_id, moderation_status, verified, created_at desc);

create table if not exists public.pro_ranking_snapshots (
  id uuid primary key default gen_random_uuid(),
  pro_user_id uuid not null references public.pro_profiles(user_id) on delete cascade,
  market_slug text,
  category_slug text,
  ranking_score integer not null,
  response_speed_score integer not null default 0,
  review_quality_score integer not null default 0,
  geo_relevance_score integer not null default 0,
  unlock_conversion_score integer not null default 0,
  completed_jobs_score integer not null default 0,
  repeat_customer_score integer not null default 0,
  lead_responsiveness_score integer not null default 0,
  reasons jsonb not null default '[]'::jsonb,
  calculated_at timestamptz not null default now()
);

create index if not exists idx_pro_ranking_snapshots_lookup
  on public.pro_ranking_snapshots (market_slug, category_slug, ranking_score desc, calculated_at desc);

create or replace function public.refresh_pro_rating_summary(p_pro_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_summary jsonb;
begin
  select jsonb_build_object(
    'average', coalesce(round(avg(rating)::numeric, 2), 0),
    'count', count(*),
    'qualityAverage', coalesce(round(avg(quality_rating)::numeric, 2), 0),
    'communicationAverage', coalesce(round(avg(communication_rating)::numeric, 2), 0),
    'valueAverage', coalesce(round(avg(value_rating)::numeric, 2), 0),
    'punctualityAverage', coalesce(round(avg(punctuality_rating)::numeric, 2), 0)
  )
  into v_summary
  from public.pro_reviews
  where pro_user_id = p_pro_user_id
    and moderation_status = 'approved';

  update public.pro_profiles
  set rating_summary = v_summary,
      updated_at = now()
  where user_id = p_pro_user_id;

  return v_summary;
end;
$$;

create or replace function public.set_pro_review_verified()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if new.request_id is not null and new.customer_user_id is not null then
    new.verified := exists (
      select 1
      from public.service_requests sr
      left join public.pro_lead_access pla
        on pla.request_id = sr.id
        and pla.pro_user_id = new.pro_user_id
      left join public.conversations c
        on c.request_id = sr.id
        and c.pro_user_id = new.pro_user_id
      where sr.id = new.request_id
        and sr.customer_user_id = new.customer_user_id
        and (pla.id is not null or c.id is not null)
    );
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.update_pro_review_summary()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  perform public.refresh_pro_rating_summary(coalesce(new.pro_user_id, old.pro_user_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists set_pro_review_verified_before_write on public.pro_reviews;
create trigger set_pro_review_verified_before_write
  before insert or update on public.pro_reviews
  for each row execute function public.set_pro_review_verified();

drop trigger if exists update_pro_review_summary_after_write on public.pro_reviews;
create trigger update_pro_review_summary_after_write
  after insert or update or delete on public.pro_reviews
  for each row execute function public.update_pro_review_summary();

alter table public.pro_reviews enable row level security;
alter table public.pro_ranking_snapshots enable row level security;
