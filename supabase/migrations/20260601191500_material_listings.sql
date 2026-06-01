create table if not exists public.material_listings (
  id uuid primary key default gen_random_uuid(),
  public_slug text not null unique,
  title text not null,
  category text not null,
  condition text not null,
  price_cents integer,
  city text not null,
  state text not null,
  description text not null,
  seller_name text not null,
  seller_email text not null,
  seller_phone text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint material_listings_status_check
    check (status in ('pending', 'approved', 'rejected', 'archived')),
  constraint material_listings_condition_check
    check (condition in ('new', 'open_box', 'leftover', 'used', 'salvaged')),
  constraint material_listings_price_check
    check (price_cents is null or price_cents >= 0)
);

create index if not exists material_listings_status_created_at_idx
  on public.material_listings (status, created_at desc);

create index if not exists material_listings_location_idx
  on public.material_listings (state, city);

alter table public.material_listings enable row level security;

drop policy if exists "Approved material listings are public"
  on public.material_listings;

create policy "Approved material listings are public"
  on public.material_listings
  for select
  using (status = 'approved');
