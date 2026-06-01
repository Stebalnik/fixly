alter table public.material_listings
  alter column status set default 'approved';

update public.material_listings
set status = 'approved',
    published_at = coalesce(published_at, now()),
    updated_at = now()
where status = 'pending';
