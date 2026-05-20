#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LATEST_DIR="$ROOT_DIR/snapshots/latest"
ARCHIVE_DIR="$ROOT_DIR/snapshots/archive"
TIMESTAMP="$(date +"%Y-%m-%d_%H-%M-%S")"
ARCHIVE_NAME="fixly-snapshot-${TIMESTAMP}.tar.gz"
ARCHIVE_PATH="$LATEST_DIR/$ARCHIVE_NAME"
SCHEMA_PATH="$LATEST_DIR/SUPABASE_SCHEMA.sql"
PG_DUMP_WARNING=""

cd "$ROOT_DIR"

echo "Snapshot started"

mkdir -p "$LATEST_DIR" "$ARCHIVE_DIR"
find "$LATEST_DIR" -maxdepth 1 -type f -name "fixly-snapshot-*.tar.gz" -exec mv {} "$ARCHIVE_DIR"/ \;

get_env_names() {
  node - <<'NODE'
const fs = require("fs");
const path = require("path");

const ignoredDirs = new Set(["node_modules", ".next", ".git", "snapshots", "dist", "coverage"]);
const names = new Set(Object.keys(process.env));

function parseEnvFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const normalized = trimmed.startsWith("export ")
      ? trimmed.slice("export ".length).trim()
      : trimmed;
    const match = normalized.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=/);

    if (match) names.add(match[1]);
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
console.log([...names].sort().join("\n"));
NODE
}

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

write_project_tree() {
  {
    echo "# Project Tree"
    echo
    echo "Generated: $TIMESTAMP"
    echo
    find . \
      -path "./node_modules" -prune -o \
      -path "./.next" -prune -o \
      -path "./.git" -prune -o \
      -path "./snapshots/archive" -prune -o \
      -path "./dist" -prune -o \
      -path "./coverage" -prune -o \
      -path "./tmp" -prune -o \
      -path "./logs" -prune -o \
      -name ".env*" -prune -o \
      -print |
      sed 's#^\./##' |
      sort |
      sed 's#^$#.#'
  } > "$LATEST_DIR/PROJECT_TREE.md"
}

write_routes() {
  {
    echo "# App Routes"
    echo
    echo "Generated: $TIMESTAMP"
    echo
    if [ -d "src/app" ]; then
      find src/app -type f \
        \( -name "route.ts" -o -name "page.tsx" -o -name "layout.tsx" \) |
        sort
    else
      echo "src/app not found."
    fi
  } > "$LATEST_DIR/ROUTES.md"
}

write_changed_files() {
  {
    echo "# Changed Files"
    echo
    echo "Generated: $TIMESTAMP"
    echo
    echo "## Current Branch"
    echo
    git branch --show-current 2>/dev/null || echo "unknown"
    echo
    echo "## git status --short"
    echo
    git status --short || true
    echo
    echo "## Last 5 Commits"
    echo
    git log -5 --oneline --decorate || true
  } > "$LATEST_DIR/CHANGED_FILES.md"
}

write_supabase_metadata() {
  local env_names
  env_names="$(get_env_names)"

  {
    echo "# Supabase Metadata"
    echo
    echo "Generated: $TIMESTAMP"
    echo
    echo "## Expected Env Keys"
    echo
    echo "- \`NEXT_PUBLIC_SUPABASE_URL\`"
    echo "- \`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY\`"
    echo "- \`SUPABASE_SERVICE_ROLE_KEY\`"
    echo "- \`SUPABASE_DB_URL\`"
    echo
    echo "## Detected Supabase Env Key Names"
    echo
    printf "%s\n" "$env_names" |
      grep -E '^(NEXT_PUBLIC_SUPABASE_|SUPABASE_)' |
      sed 's/^/- `/' |
      sed 's/$/`/' || echo "No Supabase env keys detected."
    echo
    echo "## Safety Notes"
    echo
    echo "- Public marketplace pages must never expose request_contacts"
    echo "- Public pages should read only from service_requests"
    echo
    echo "## Migrations"
    echo
    if compgen -G "supabase/migrations/*.sql" >/dev/null; then
      find supabase/migrations -maxdepth 1 -type f -name "*.sql" |
        sort |
        sed 's#^supabase/migrations/##' |
        sed 's/^/- `/' |
        sed 's/$/`/'
    else
      echo "No migrations found."
    fi
  } > "$LATEST_DIR/SUPABASE_METADATA.md"
}

export_supabase_schema() {
  bash scripts/db-schema-dump.sh >/dev/null || true

  if [ -f "$LATEST_DIR/SUPABASE_SCHEMA.warning.txt" ]; then
    PG_DUMP_WARNING="$(cat "$LATEST_DIR/SUPABASE_SCHEMA.warning.txt")"
  fi
}

write_project_summary() {
  local node_version
  local pnpm_version
  local env_names

  node_version="$(node --version 2>/dev/null || echo "unavailable")"
  pnpm_version="$(pnpm --version 2>/dev/null || echo "unavailable")"
  env_names="$(get_env_names)"

  {
    echo "# Project Summary"
    echo
    echo "- Generated: $TIMESTAMP"
    echo "- Git branch: $(git branch --show-current 2>/dev/null || echo "unknown")"
    echo "- Commit: $(git rev-parse HEAD 2>/dev/null || echo "unknown")"
    echo "- Node version: $node_version"
    echo "- pnpm version: $pnpm_version"
    if [ -n "$PG_DUMP_WARNING" ]; then
      echo "- Supabase schema warning: $PG_DUMP_WARNING"
    fi
    echo
    echo "## Package Scripts"
    echo
    if [ -f "package.json" ]; then
      node - <<'NODE'
const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const scripts = pkg.scripts || {};
for (const [name, command] of Object.entries(scripts)) {
  console.log(`- \`${name}\`: \`${command}\``);
}
NODE
    else
      echo "package.json not found."
    fi
    echo
    echo "## Detected Env Key Names"
    echo
    if [ -n "$env_names" ]; then
      printf "%s\n" "$env_names" |
        sed 's/^/- `/' |
        sed 's/$/`/'
    else
      echo "No env keys detected."
    fi
  } > "$LATEST_DIR/PROJECT_SUMMARY.md"
}

build_snapshot_archive() {
  local include_paths=()
  local candidate

  for candidate in \
    "src" \
    "supabase" \
    "scripts" \
    "public" \
    "package.json" \
    "pnpm-lock.yaml" \
    "tsconfig.json" \
    "next.config.ts" \
    "eslint.config.mjs" \
    "README.md" \
    "PROJECT_STATE.md" \
    "AGENTS.md" \
    "CLAUDE.md" \
    "snapshots/latest/PROJECT_TREE.md" \
    "snapshots/latest/ROUTES.md" \
    "snapshots/latest/CHANGED_FILES.md" \
    "snapshots/latest/PROJECT_SUMMARY.md" \
    "snapshots/latest/SUPABASE_METADATA.md" \
    "snapshots/latest/SUPABASE_SCHEMA.sql"; do
    if [ -e "$candidate" ]; then
      include_paths+=("$candidate")
    fi
  done

  tar \
    --exclude="node_modules" \
    --exclude=".next" \
    --exclude=".git" \
    --exclude=".env" \
    --exclude=".env.*" \
    --exclude=".DS_Store" \
    --exclude="snapshots/archive" \
    --exclude="coverage" \
    --exclude="dist" \
    --exclude="tmp" \
    --exclude="logs" \
    -czf "$ARCHIVE_PATH" \
    "${include_paths[@]}"
}

echo "Generating reports"
write_project_tree
write_routes
write_changed_files
write_supabase_metadata

echo "Exporting schema"
export_supabase_schema
write_project_summary

echo "Creating archive"
build_snapshot_archive

echo "Snapshot completed"
echo "Created snapshot: $ARCHIVE_PATH"
