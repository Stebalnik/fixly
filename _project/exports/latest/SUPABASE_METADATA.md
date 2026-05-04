# SUPABASE_METADATA

Generated: Mon May  4 11:14:38 EDT 2026

## Environment keys expected
```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_DB_URL
```

## Known application tables

- service_requests
- request_contacts

## Known privacy rule

Public marketplace pages should read from service_requests only.
Private customer contact data is stored in request_contacts and should not be publicly selected.

## Supabase schema dump

Schema dump included in:

```txt
SUPABASE_SCHEMA.sql
```
