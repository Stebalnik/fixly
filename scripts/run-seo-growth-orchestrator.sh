#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${FIXLY_ENV_FILE:-}"

if [[ -z "${ENV_FILE}" ]]; then
  if [[ -f ".env.production" ]]; then
    ENV_FILE=".env.production"
  elif [[ -f ".env.local" ]]; then
    ENV_FILE=".env.local"
  fi
fi

if [[ -n "${ENV_FILE}" && -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a
fi

if [[ ! -x "./node_modules/.bin/tsx" ]]; then
  echo "Missing local tsx binary. Run pnpm install in /var/www/fixly-web." >&2
  exit 1
fi

./node_modules/.bin/tsx scripts/ai-agent-worker.ts seo-growth-orchestrator
