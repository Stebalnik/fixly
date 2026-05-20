#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LATEST_DIR="$ROOT_DIR/snapshots/latest"
SCHEMA_PATH="$LATEST_DIR/SUPABASE_SCHEMA.sql"
WARNING_PATH="$LATEST_DIR/SUPABASE_SCHEMA.warning.txt"

cd "$ROOT_DIR"
mkdir -p "$LATEST_DIR"

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

warn() {
  rm -f "$SCHEMA_PATH"
  printf "%s\n" "$1" > "$WARNING_PATH"
  echo "$1"
}

rm -f "$SCHEMA_PATH" "$WARNING_PATH"

db_url="$(get_env_value "SUPABASE_DB_URL")"

if [ -z "$db_url" ]; then
  warn "SUPABASE_DB_URL was not detected; SUPABASE_SCHEMA.sql was not generated."
  exit 0
fi

if ! command -v pg_dump >/dev/null 2>&1; then
  warn "pg_dump is not available; SUPABASE_SCHEMA.sql was not generated."
  exit 0
fi

if pg_dump --schema-only --no-owner --no-privileges "$db_url" > "$SCHEMA_PATH" 2>/dev/null; then
  echo "Schema dumped to snapshots/latest/SUPABASE_SCHEMA.sql"
  exit 0
fi

warn "pg_dump failed; SUPABASE_SCHEMA.sql was not generated."
