alter table public.material_listings
  add column if not exists seller_user_id uuid references auth.users(id) on delete set null;

create index if not exists material_listings_seller_user_id_idx
  on public.material_listings (seller_user_id, created_at desc);
