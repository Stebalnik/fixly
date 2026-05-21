-- Fixly Supabase migration
-- Created: 2026-05-21T04:16:46Z
-- Purpose: Add pro service coverage, subcategory, verification, and review text foundations.
-- Safety: Additive columns and non-destructive backfill only; no pricing or private contact changes.
-- Rollback notes: Drop added columns if profile coverage and verification move to separate tables.

alter table public.pro_profiles
  add column if not exists home_market_slug text,
  add column if not exists service_radius_miles integer not null default 15,
  add column if not exists derived_service_area_slugs text[] not null default '{}',
  add column if not exists service_subcategories text[] not null default '{}',
  add column if not exists identity_verified boolean not null default false,
  add column if not exists license_verified boolean not null default false,
  add column if not exists background_check_status text not null default 'not_started';

update public.pro_profiles
set
  home_market_slug = coalesce(home_market_slug, service_areas[1]),
  derived_service_area_slugs = case
    when cardinality(derived_service_area_slugs) = 0 then service_areas
    else derived_service_area_slugs
  end
where home_market_slug is null
  or cardinality(derived_service_area_slugs) = 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'pro_profiles_service_radius_allowed'
      and conrelid = 'public.pro_profiles'::regclass
  ) then
    alter table public.pro_profiles
      add constraint pro_profiles_service_radius_allowed
      check (service_radius_miles in (5, 15, 30, 50))
      not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'pro_profiles_background_check_status_allowed'
      and conrelid = 'public.pro_profiles'::regclass
  ) then
    alter table public.pro_profiles
      add constraint pro_profiles_background_check_status_allowed
      check (background_check_status in ('not_started', 'pending', 'clear', 'needs_review', 'rejected'))
      not valid;
  end if;
end;
$$;

create index if not exists idx_pro_profiles_home_market
  on public.pro_profiles (home_market_slug)
  where home_market_slug is not null;

create index if not exists idx_pro_profiles_service_subcategories
  on public.pro_profiles using gin (service_subcategories);

create index if not exists idx_pro_profiles_derived_service_areas
  on public.pro_profiles using gin (derived_service_area_slugs);

alter table public.pro_reviews
  add column if not exists review_text text;

update public.pro_reviews
set review_text = review_body
where review_text is null
  and review_body is not null;
