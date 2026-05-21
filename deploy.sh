#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-fixly-web}"
BRANCH="${BRANCH:-main}"
REMOTE="${REMOTE:-origin}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3000/}"
HEALTH_RETRIES="${HEALTH_RETRIES:-20}"
HEALTH_SLEEP_SECONDS="${HEALTH_SLEEP_SECONDS:-3}"

PM2_WAS_STOPPED="false"

log() {
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $*"
}

has_pm2_process() {
  pm2 describe "$APP_NAME" >/dev/null 2>&1
}

verify_next_artifacts() {
  log "Verifying Next artifacts"

  if [ ! -f ".next/prerender-manifest.json" ]; then
    echo "Deploy failed: .next/prerender-manifest.json is missing." >&2
    echo "PM2 will not be restarted with an incomplete Next build." >&2
    exit 1
  fi

  if [ ! -f ".next/BUILD_ID" ]; then
    echo "Deploy failed: .next/BUILD_ID is missing." >&2
    echo "PM2 will not be restarted with an incomplete Next build." >&2
    exit 1
  fi
}

recover_pm2() {
  if [ "$PM2_WAS_STOPPED" != "true" ]; then
    return
  fi

  log "Deploy failed after PM2 stop; attempting safe recovery"

  if [ -f ".next/prerender-manifest.json" ] && has_pm2_process; then
    pm2 restart "$APP_NAME" || true
    pm2 save || true
    return
  fi

  if [ -f ".next/prerender-manifest.json" ]; then
    pm2 resurrect || true
    pm2 restart "$APP_NAME" || true
    pm2 save || true
    return
  fi

  log "Recovery skipped because no complete .next build is available"
}

on_error() {
  local exit_code=$?
  recover_pm2
  exit "$exit_code"
}

trap on_error ERR

log "Fetching latest code"
git fetch "$REMOTE" "$BRANCH"

log "Resetting working tree to $REMOTE/$BRANCH"
git reset --hard "$REMOTE/$BRANCH"

log "Installing dependencies"
pnpm install --frozen-lockfile

log "Stopping PM2 process"
if has_pm2_process; then
  pm2 stop "$APP_NAME"
  PM2_WAS_STOPPED="true"
else
  log "PM2 process $APP_NAME does not exist yet"
fi

log "Cleaning build"
rm -rf .next

log "Building application"
pnpm build
log "Build completed"

verify_next_artifacts

log "Restarting PM2"
if has_pm2_process; then
  pm2 restart "$APP_NAME"
else
  pm2 start "pnpm" --name "$APP_NAME" -- start
fi

log "Saving PM2 process list"
pm2 save

log "Running health checks"
for attempt in $(seq 1 "$HEALTH_RETRIES"); do
  if curl -fsS "$HEALTH_URL" >/dev/null; then
    log "Health checks passed"
    exit 0
  fi

  log "Health check attempt $attempt/$HEALTH_RETRIES failed"
  sleep "$HEALTH_SLEEP_SECONDS"
done

echo "Deploy failed: health checks did not pass for $HEALTH_URL" >&2
exit 1
