#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

set +u
set -a
[ -f .env.local ] && source .env.local
[ -f .env ] && source .env
set +a
set -u

reason=""
file_path=""
text_url=""

usage() {
  cat <<'USAGE'
Usage:
  bash scripts/gsc-import-page-indexing.sh --reason "Not found (404)" --text-url "https://fixly.work/us/ky/blandville/plumbing"
  bash scripts/gsc-import-page-indexing.sh --reason "Not found (404)" --file "/tmp/gsc-404/Таблица.csv"

Options:
  --reason    Google Search Console page indexing reason.
  --text-url  Single URL to import as text/plain.
  --file      CSV, TSV, or TXT export file to import.
USAGE
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --reason)
      reason="${2:-}"
      shift 2
      ;;
    --text-url)
      text_url="${2:-}"
      shift 2
      ;;
    --file)
      file_path="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [ -z "$reason" ]; then
  echo "Missing --reason." >&2
  usage >&2
  exit 2
fi

if [ -n "$file_path" ] && [ -n "$text_url" ]; then
  echo "Use either --file or --text-url, not both." >&2
  exit 2
fi

if [ -z "$file_path" ] && [ -z "$text_url" ]; then
  echo "Missing input. Use --file or --text-url." >&2
  usage >&2
  exit 2
fi

if [ -z "${INTERNAL_AI_AGENT_TOKEN:-}" ]; then
  echo "INTERNAL_AI_AGENT_TOKEN is not configured in .env.local or .env." >&2
  exit 1
fi

base_url="${FIXLY_GSC_IMPORT_BASE_URL:-${NEXT_PUBLIC_SITE_URL:-https://fixly.work}}"
query="$(node -e 'process.stdout.write(new URLSearchParams({ reason: process.argv[1] }).toString())' "$reason")"
endpoint="${base_url%/}/api/internal/ai-agents/gsc-page-indexing-import?${query}"

content_type="text/plain; charset=utf-8"
curl_data_args=()

if [ -n "$file_path" ]; then
  if [ ! -f "$file_path" ]; then
    echo "File not found: $file_path" >&2
    exit 1
  fi

  extension="${file_path##*.}"
  extension="$(printf '%s' "$extension" | tr '[:upper:]' '[:lower:]')"

  case "$extension" in
    csv)
      content_type="text/csv; charset=utf-8"
      ;;
    tsv)
      content_type="text/tab-separated-values; charset=utf-8"
      ;;
    txt)
      content_type="text/plain; charset=utf-8"
      ;;
    *)
      echo "Unsupported file extension: .$extension. Use csv, tsv, or txt." >&2
      exit 2
      ;;
  esac

  curl_data_args=(--data-binary "@${file_path}")
else
  curl_data_args=(--data-binary "${text_url}"$'\n')
fi

response_body="$(mktemp)"
trap 'rm -f "$response_body"' EXIT

status="$(
  curl -sS \
    -o "$response_body" \
    -w "%{http_code}" \
    -X POST "$endpoint" \
    -H "Authorization: Bearer ${INTERNAL_AI_AGENT_TOKEN}" \
    -H "Content-Type: ${content_type}" \
    "${curl_data_args[@]}"
)"

printf 'HTTP %s\n' "$status"
cat "$response_body"
printf '\n'
