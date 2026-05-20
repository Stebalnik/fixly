#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIGRATIONS_DIR="$ROOT_DIR/supabase/migrations"

cd "$ROOT_DIR"

get_env_value() {
  local key="$1"

  TARGET_ENV_KEY="$key" node - <<'NODE'
const fs = require("fs");
const path = require("path");

const key = process.env.TARGET_ENV_KEY;
if (!key) process.exit(0);
if (process.env[key]) {
  process.stdout.write(process.env[key]);
  process.exit(0);
}

const ignoredDirs = new Set(["node_modules", ".next", ".git", "snapshots", "dist", "coverage"]);

function parseEnvFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const normalized = trimmed.startsWith("export ")
      ? trimmed.slice("export ".length).trim()
      : trimmed;
    const match = normalized.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/);

    if (!match || match[1] !== key) continue;

    let value = match[2].trim();
    const quote = value[0];
    if ((quote === '"' || quote === "'") && value.endsWith(quote)) {
      value = value.slice(1, -1);
    }

    if (!value) continue;

    process.stdout.write(value);
    process.exit(0);
  }
}

function walk(dir, depth = 0) {
  if (depth > 2) return;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue;

    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(entryPath, depth + 1);
      continue;
    }

    if (entry.isFile() && entry.name.startsWith(".env")) {
      parseEnvFile(entryPath);
    }
  }
}

walk(".");
NODE
}

sql_escape() {
  printf "%s" "$1" | sed "s/'/''/g"
}

checksum_file() {
  shasum -a 256 "$1" | awk '{print $1}'
}

contains_destructive_sql() {
  perl -0777 -ne '
    my $s = lc $_;
    if (
      $s =~ /\bdrop\s+table\b/ ||
      $s =~ /\bdrop\s+column\b/ ||
      $s =~ /\btruncate\b/ ||
      $s =~ /\bdelete\s+from\b/ ||
      $s =~ /\balter\s+table\b[\s\S]*?\bdrop\b/ ||
      $s =~ /\bdrop\s+function\b/ ||
      $s =~ /\bdrop\s+policy\b/
    ) {
      exit 0;
    }
    exit 1;
  ' "$1"
}

db_url="$(get_env_value "SUPABASE_DB_URL")"

if [ -z "$db_url" ]; then
  echo "SUPABASE_DB_URL is required for migrations."
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is required for migrations."
  exit 1
fi

mkdir -p "$MIGRATIONS_DIR"

echo "Ensuring migration tracking table"
psql "$db_url" -v ON_ERROR_STOP=1 -q -c "
create table if not exists public.schema_migrations (
  id text primary key,
  filename text not null,
  checksum text not null,
  applied_at timestamptz not null default now()
);
" >/dev/null

shopt -s nullglob
migrations=("$MIGRATIONS_DIR"/*.sql)

if [ "${#migrations[@]}" -eq 0 ]; then
  echo "No migrations found."
  exit 0
fi

for migration in "${migrations[@]}"; do
  filename="$(basename "$migration")"
  id="${filename%.sql}"
  checksum="$(checksum_file "$migration")"
  id_sql="$(sql_escape "$id")"
  filename_sql="$(sql_escape "$filename")"
  checksum_sql="$(sql_escape "$checksum")"
  migration_sql="$(sql_escape "$migration")"

  applied_checksum="$(
    psql "$db_url" -v ON_ERROR_STOP=1 -q -tA \
      -c "select checksum from public.schema_migrations where id = '$id_sql';"
  )"

  if [ -n "$applied_checksum" ]; then
    if [ "$applied_checksum" != "$checksum" ]; then
      echo "Refusing changed applied migration: $filename"
      exit 1
    fi

    echo "Skipping already applied migration: $filename"
    continue
  fi

  if contains_destructive_sql "$migration" &&
    ! grep -Eq '^[[:space:]]*--[[:space:]]*DESTRUCTIVE_CHANGE_APPROVED[[:space:]]*$' "$migration"; then
    echo "Blocked destructive migration without approval marker: $filename"
    exit 1
  fi

  temp_sql="$(mktemp "${TMPDIR:-/tmp}/fixly-migration.XXXXXX.sql")"
  cat > "$temp_sql" <<SQL
begin;
\i '$migration_sql'
insert into public.schema_migrations (id, filename, checksum)
values ('$id_sql', '$filename_sql', '$checksum_sql');
commit;
SQL

  echo "Applying migration: $filename"

  if ! psql "$db_url" -v ON_ERROR_STOP=1 -q -f "$temp_sql" >/dev/null; then
    rm -f "$temp_sql"
    echo "Migration failed: $filename"
    exit 1
  fi

  rm -f "$temp_sql"
  echo "Applied migration: $filename"
done

echo "Migrations complete."
