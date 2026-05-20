# Fixly Supabase

Supabase SQL migrations live in `supabase/migrations`.

Create a new migration with:

```bash
pnpm db:migration:new migration_name
```

Apply pending migrations with:

```bash
pnpm db:migrate
```

Production changes should be idempotent where possible. Prefer `create table if not exists`, `create index if not exists`, guarded policy/function creation, and `alter table` statements that are safe to rerun or clearly protected.

Destructive changes require an explicit marker comment in the migration file:

```sql
-- DESTRUCTIVE_CHANGE_APPROVED
```

Destructive SQL includes dropping tables, columns, functions, or policies, truncating tables, and broad deletes.
