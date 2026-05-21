# Supabase Metadata

Generated: 2026-05-20_22-56-52

## Expected Env Keys

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

## Detected Supabase Env Key Names

- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_DB_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Safety Notes

- Public marketplace pages must never expose request_contacts
- Public pages should read only from service_requests

## Migrations

- `20260520184536_test_connection_check.sql`
- `20260520192059_harden_lead_unlock_idempotency.sql`
- `20260520214038_marketplace_core_atomic_fixa.sql`
- `20260520222030_seo_growth_orchestration_runs.sql`
- `20260520223353_marketplace_trust_reputation_layer.sql`
