-- Fixly Supabase migration
-- Created: 2026-06-18T18:50:00Z
-- Purpose: Add public storage bucket for compressed pro profile media.
-- Safety: Additive storage bucket/policies only; no existing data is modified.
-- Rollback notes: Remove policies and bucket after migrating or deleting stored media.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'pro-profile-media',
  'pro-profile-media',
  true,
  750000,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types,
  updated_at = now();

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public read pro profile media'
  ) then
    create policy "Public read pro profile media"
      on storage.objects
      for select
      using (bucket_id = 'pro-profile-media');
  end if;
end;
$$;
