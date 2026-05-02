#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

if [ -f ".env.local" ]; then
  set -a
  source .env.local
  set +a
fi

DATE_STAMP="$(date +"%Y-%m-%d")"
TIMESTAMP="$(date +"%Y-%m-%d_%H-%M-%S")"

EXPORT_BASE="_project/exports"
EXPORT_DIR="$EXPORT_BASE/archive/$TIMESTAMP"
LATEST_DIR="$EXPORT_BASE/latest"

mkdir -p "$EXPORT_DIR" "$LATEST_DIR"

PROJECT_CONTEXT_FILE="$EXPORT_DIR/PROJECT_CONTEXT.md"
PROJECT_STRUCTURE_FILE="$EXPORT_DIR/PROJECT_STRUCTURE.md"
ROUTES_FILE="$EXPORT_DIR/ROUTES.md"
CODE_SNAPSHOT_FILE="$EXPORT_DIR/CODE_SNAPSHOT.md"
SUPABASE_SCHEMA_FILE="$EXPORT_DIR/SUPABASE_SCHEMA.sql"
SUPABASE_METADATA_FILE="$EXPORT_DIR/SUPABASE_METADATA.md"

EXCLUDE_PATHS=(
  "./node_modules"
  "./.next"
  "./.git"
  "./coverage"
  "./dist"
  "./build"
  "./dump"
  "./.turbo"
  "./_project/exports"
)

prune_expr=()
for path in "${EXCLUDE_PATHS[@]}"; do
  prune_expr+=( -path "$path" -o )
done
unset 'prune_expr[${#prune_expr[@]}-1]'

is_text_file() {
  case "$1" in
    *.ts|*.tsx|*.js|*.jsx|*.json|*.css|*.md|*.sh|*.sql|*.yml|*.yaml|*.mjs|*.cjs|*.html|*.txt|*.env.example)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

lang_for_file() {
  local file="$1"
  local ext="${file##*.}"

  case "$ext" in
    ts) echo "ts" ;;
    tsx) echo "tsx" ;;
    js|mjs|cjs) echo "js" ;;
    jsx) echo "jsx" ;;
    json) echo "json" ;;
    css) echo "css" ;;
    md) echo "md" ;;
    sh) echo "bash" ;;
    sql) echo "sql" ;;
    yml|yaml) echo "yaml" ;;
    html) echo "html" ;;
    *) echo "" ;;
  esac
}

find_project_files() {
  find . \
    \( "${prune_expr[@]}" \) -prune \
    -o -type f \
    ! -name ".DS_Store" \
    ! -name "tsconfig.tsbuildinfo" \
    ! -name "*.ico" \
    ! -name "*.png" \
    ! -name "*.jpg" \
    ! -name "*.jpeg" \
    ! -name "*.webp" \
    ! -name "*.svg" \
    -print | sort
}

find_project_dirs() {
  find . \
    \( "${prune_expr[@]}" \) -prune \
    -o -type d -print | sort
}

find_route_files() {
  find . \
    \( "${prune_expr[@]}" \) -prune \
    -o -type f \( \
      -path "*/app/*/page.tsx" \
      -o -path "*/app/page.tsx" \
      -o -path "*/app/*/layout.tsx" \
      -o -path "*/app/layout.tsx" \
      -o -path "*/app/*/route.ts" \
      -o -path "*/app/*/loading.tsx" \
      -o -path "*/app/*/error.tsx" \
      -o -path "*/app/*/not-found.tsx" \
      -o -path "*/app/sitemap.ts" \
      -o -path "*/app/robots.ts" \
    \) -print | sort
}

# -----------------------------
# PROJECT_CONTEXT.md
# -----------------------------
{
  echo "# Fixly Project Context Snapshot"
  echo
  echo "Generated: $(date)"
  echo "Project root: $ROOT_DIR"
  echo "Export folder: $EXPORT_DIR"
  echo

  echo "## 1. Project purpose"
  echo
  echo "Fixly.work is a Next.js home services SEO website and lead marketplace."
  echo "The platform has SEO service pages, geo-aware pages, a /book request flow, public request pages, and Supabase-backed lead storage."
  echo

  echo "## 2. Directory tree"
  echo '```txt'
  find_project_dirs
  echo '```'
  echo

  echo "## 3. File list"
  echo '```txt'
  find_project_files
  echo '```'
  echo

  echo "## 4. App routes"
  echo '```txt'
  find_route_files
  echo '```'
  echo

  echo "## 5. Package.json"
  echo '```json'
  if [ -f package.json ]; then
    cat package.json
  else
    echo "{}"
  fi
  echo '```'
  echo

  echo "## 6. Important config files"
  echo '```txt'
  for f in package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json next.config.js next.config.ts eslint.config.mjs middleware.ts .gitignore AGENTS.md CLAUDE.md README.md; do
    [ -f "$f" ] && echo "$f"
  done
  echo '```'
  echo

  echo "## 7. Project docs"
  echo '```txt'
  if [ -d "_project/docs" ]; then
    find _project/docs -type f | sort
  else
    echo "No _project/docs directory found."
  fi
  echo '```'
} > "$PROJECT_CONTEXT_FILE"

# -----------------------------
# PROJECT_STRUCTURE.md
# -----------------------------
{
  echo "# PROJECT_STRUCTURE"
  echo
  echo "Generated: $(date)"
  echo

  echo "## 1. Directories"
  echo '```txt'
  find_project_dirs
  echo '```'
  echo

  echo "## 2. Files"
  echo '```txt'
  find_project_files
  echo '```'
  echo

  echo "## 3. Route files"
  echo '```txt'
  find_route_files
  echo '```'
  echo

  echo "## 4. Source code folders"
  echo '```txt'
  for dir in src app lib components features styles public supabase _project; do
    [ -d "$dir" ] && echo "$dir"
  done
  echo '```'
} > "$PROJECT_STRUCTURE_FILE"

# -----------------------------
# ROUTES.md
# -----------------------------
{
  echo "# ROUTES"
  echo
  echo "Generated: $(date)"
  echo

  echo "## App router files"
  echo '```txt'
  find_route_files
  echo '```'
} > "$ROUTES_FILE"

# -----------------------------
# CODE_SNAPSHOT.md
# -----------------------------
{
  echo "# CODE_SNAPSHOT"
  echo
  echo "Generated: $(date)"
  echo
  echo "> Auto-generated snapshot of project text/code files."
  echo

  while IFS= read -r file; do
    [ -f "$file" ] || continue

    if ! is_text_file "$file"; then
      continue
    fi

    echo "## FILE: ${file#./}"
    echo

    lang="$(lang_for_file "$file")"
    echo "\`\`\`${lang}"
    cat "$file"
    echo
    echo "\`\`\`"
    echo
  done < <(find_project_files)
} > "$CODE_SNAPSHOT_FILE"

# -----------------------------
# SUPABASE_SCHEMA.sql
# -----------------------------
dump_supabase_schema() {
  if [ "${SKIP_SUPABASE_DUMP:-0}" = "1" ]; then
    echo "Skipping Supabase schema export: SKIP_SUPABASE_DUMP=1"
    return 0
  fi

  echo "Generating Supabase schema dump..."

  if [ -z "${SUPABASE_DB_URL:-}" ]; then
    echo "-- SUPABASE_DB_URL is not set. Schema dump skipped." > "$SUPABASE_SCHEMA_FILE"
    echo "SUPABASE_DB_URL is not set. Schema dump skipped."
    return 0
  fi

  local timeout_bin=""
  if command -v gtimeout >/dev/null 2>&1; then
    timeout_bin="gtimeout"
  elif command -v timeout >/dev/null 2>&1; then
    timeout_bin="timeout"
  fi

  if [ -n "$timeout_bin" ]; then
    "$timeout_bin" 180 npx --yes supabase db dump \
      --db-url "$SUPABASE_DB_URL" \
      -f "$SUPABASE_SCHEMA_FILE"
  else
    npx --yes supabase db dump \
      --db-url "$SUPABASE_DB_URL" \
      -f "$SUPABASE_SCHEMA_FILE"
  fi

  echo "Supabase schema exported to $SUPABASE_SCHEMA_FILE"
}

dump_supabase_schema || {
  echo "-- Supabase schema export failed." > "$SUPABASE_SCHEMA_FILE"
  echo "Supabase schema export failed, continuing with code snapshot."
}

# -----------------------------
# SUPABASE_METADATA.md
# -----------------------------
{
  echo "# SUPABASE_METADATA"
  echo
  echo "Generated: $(date)"
  echo

  echo "## Environment keys expected"
  echo '```txt'
  echo "NEXT_PUBLIC_SUPABASE_URL"
  echo "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
  echo "SUPABASE_DB_URL"
  echo '```'
  echo

  echo "## Known application tables"
  echo
  echo "- service_requests"
  echo "- request_contacts"
  echo

  echo "## Known privacy rule"
  echo
  echo "Public marketplace pages should read from service_requests only."
  echo "Private customer contact data is stored in request_contacts and should not be publicly selected."
  echo

  echo "## Supabase schema dump"
  echo
  if [ -f "$SUPABASE_SCHEMA_FILE" ]; then
    echo "Schema dump included in:"
    echo
    echo '```txt'
    echo "SUPABASE_SCHEMA.sql"
    echo '```'
  else
    echo "No schema dump was generated."
  fi
} > "$SUPABASE_METADATA_FILE"

# -----------------------------
# Update latest
# -----------------------------
rm -rf "$LATEST_DIR"
mkdir -p "$LATEST_DIR"

cp -f "$PROJECT_CONTEXT_FILE" "$LATEST_DIR/PROJECT_CONTEXT.md"
cp -f "$PROJECT_STRUCTURE_FILE" "$LATEST_DIR/PROJECT_STRUCTURE.md"
cp -f "$ROUTES_FILE" "$LATEST_DIR/ROUTES.md"
cp -f "$CODE_SNAPSHOT_FILE" "$LATEST_DIR/CODE_SNAPSHOT.md"
cp -f "$SUPABASE_SCHEMA_FILE" "$LATEST_DIR/SUPABASE_SCHEMA.sql"
cp -f "$SUPABASE_METADATA_FILE" "$LATEST_DIR/SUPABASE_METADATA.md"

{
  echo "# Latest export"
  echo
  echo "Generated from: $EXPORT_DIR"
  echo "Generated at: $(date)"
  echo
  echo "Files included:"
  echo "- PROJECT_CONTEXT.md"
  echo "- PROJECT_STRUCTURE.md"
  echo "- ROUTES.md"
  echo "- CODE_SNAPSHOT.md"
  echo "- SUPABASE_SCHEMA.sql"
  echo "- SUPABASE_METADATA.md"
} > "$LATEST_DIR/README.md"

echo
echo "Export completed successfully."
echo
echo "Archive folder:"
echo "  $EXPORT_DIR"
echo
echo "Latest folder:"
echo "  $LATEST_DIR"
echo
echo "Generated files:"
echo "  $LATEST_DIR/PROJECT_CONTEXT.md"
echo "  $LATEST_DIR/PROJECT_STRUCTURE.md"
echo "  $LATEST_DIR/ROUTES.md"
echo "  $LATEST_DIR/CODE_SNAPSHOT.md"
echo "  $LATEST_DIR/SUPABASE_SCHEMA.sql"
echo "  $LATEST_DIR/SUPABASE_METADATA.md"