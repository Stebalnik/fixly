-- Fixly Supabase migration
-- Created: 2026-05-21T03:30:38Z
-- Purpose: Add explicit public pro profile display and reputation metric columns.
-- Safety: Additive columns and non-destructive backfill only; no pricing or routing changes.
-- Rollback notes: Drop added columns if public pro metrics move fully into derived views.

alter table public.pro_profiles
  add column if not exists display_name text,
  add column if not exists response_rate numeric(5, 2),
  add column if not exists rating_average numeric(3, 2) not null default 0,
  add column if not exists reviews_count integer not null default 0;

update public.pro_profiles
set
  display_name = coalesce(nullif(display_name, ''), nullif(company_name, ''), nullif(full_name, ''), 'Fixly Pro'),
  rating_average = coalesce((rating_summary->>'average')::numeric, rating_average, 0),
  reviews_count = coalesce((rating_summary->>'count')::integer, reviews_count, 0),
  response_rate = case
    when unlocked_leads_count > 0 then round((lead_response_count::numeric / unlocked_leads_count::numeric) * 100, 2)
    else response_rate
  end
where display_name is null
  or rating_average = 0
  or reviews_count = 0
  or response_rate is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'pro_profiles_response_rate_range'
      and conrelid = 'public.pro_profiles'::regclass
  ) then
    alter table public.pro_profiles
      add constraint pro_profiles_response_rate_range
      check (response_rate is null or (response_rate >= 0 and response_rate <= 100))
      not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'pro_profiles_rating_average_range'
      and conrelid = 'public.pro_profiles'::regclass
  ) then
    alter table public.pro_profiles
      add constraint pro_profiles_rating_average_range
      check (rating_average >= 0 and rating_average <= 5)
      not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'pro_profiles_reviews_count_nonnegative'
      and conrelid = 'public.pro_profiles'::regclass
  ) then
    alter table public.pro_profiles
      add constraint pro_profiles_reviews_count_nonnegative
      check (reviews_count >= 0)
      not valid;
  end if;
end;
$$;

create or replace function public.refresh_pro_rating_summary(p_pro_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_summary jsonb;
  v_average numeric;
  v_count integer;
begin
  select
    coalesce(round(avg(rating)::numeric, 2), 0),
    count(*)
  into v_average, v_count
  from public.pro_reviews
  where pro_user_id = p_pro_user_id
    and moderation_status = 'approved';

  select jsonb_build_object(
    'average', v_average,
    'count', v_count,
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
      rating_average = v_average,
      reviews_count = v_count,
      response_rate = case
        when unlocked_leads_count > 0 then round((lead_response_count::numeric / unlocked_leads_count::numeric) * 100, 2)
        else response_rate
      end,
      updated_at = now()
  where user_id = p_pro_user_id;

  return v_summary;
end;
$$;
