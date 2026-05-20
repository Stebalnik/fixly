#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIGRATIONS_DIR="$ROOT_DIR/supabase/migrations"

usage() {
  echo "Usage: pnpm db:migration:new migration_name"
}

if [ "$#" -lt 1 ]; then
  usage
  exit 1
fi

raw_name="$*"
safe_name="$(printf "%s" "$raw_name" |
  tr '[:upper:]' '[:lower:]' |
  sed -E 's/[^a-z0-9]+/_/g; s/^_+//; s/_+$//')"

if [ -z "$safe_name" ]; then
  echo "Migration name must contain at least one letter or number."
  exit 1
fi

mkdir -p "$MIGRATIONS_DIR"

timestamp="$(date +"%Y%m%d%H%M%S")"
created_at="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
file_path="$MIGRATIONS_DIR/${timestamp}_${safe_name}.sql"

if [ -e "$file_path" ]; then
  echo "Migration already exists: ${file_path#$ROOT_DIR/}"
  exit 1
fi

cat > "$file_path" <<SQL
-- Fixly Supabase migration
-- Created: $created_at
-- Purpose:
-- Safety:
-- Rollback notes:

SQL

echo "Created migration: ${file_path#$ROOT_DIR/}"
