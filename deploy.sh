#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-fixly-web}"
BRANCH="${BRANCH:-main}"
REMOTE="${REMOTE:-origin}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:4081/api/health}"
HEALTH_RETRIES="${HEALTH_RETRIES:-20}"
HEALTH_SLEEP_SECONDS="${HEALTH_SLEEP_SECONDS:-3}"
BUILD_DIR="${BUILD_DIR:-.next-build}"
LIVE_DIR="${LIVE_DIR:-.next}"
PREVIOUS_DIR="${PREVIOUS_DIR:-.next-previous}"
FAILED_DIR_PREFIX="${FAILED_DIR_PREFIX:-.next-failed}"

PM2_WAS_STOPPED="false"

log() {
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $*"
}

has_pm2_process() {
  pm2 describe "$APP_NAME" >/dev/null 2>&1
}

verify_next_artifacts() {
  local dist_dir="${1:-$LIVE_DIR}"

  log "Verifying Next artifacts in $dist_dir"

  if [ ! -f "$dist_dir/prerender-manifest.json" ]; then
    echo "Deploy failed: $dist_dir/prerender-manifest.json is missing." >&2
    echo "PM2 will not be restarted with an incomplete Next build." >&2
    exit 1
  fi

  if [ ! -f "$dist_dir/BUILD_ID" ]; then
    echo "Deploy failed: $dist_dir/BUILD_ID is missing." >&2
    echo "PM2 will not be restarted with an incomplete Next build." >&2
    exit 1
  fi
}

normalize_next_generated_files() {
  log "Normalizing Next generated type references"
  BUILD_DIR="$BUILD_DIR" node - <<'NODE'
const fs = require("fs");

const buildDir = process.env.BUILD_DIR;

if (fs.existsSync("next-env.d.ts")) {
  const before = fs.readFileSync("next-env.d.ts", "utf8");
  const after = before.replace(
    `import "./${buildDir}/types/routes.d.ts";`,
    'import "./.next/types/routes.d.ts";'
  );

  if (after !== before) fs.writeFileSync("next-env.d.ts", after);
}

if (fs.existsSync("tsconfig.json")) {
  const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedBuildDir = escapeRegExp(buildDir);
  const before = fs.readFileSync("tsconfig.json", "utf8");
  const after = before
    .replace(
      new RegExp(
        `"\\*\\*/\\*\\.mts",\\n\\s*"${escapedBuildDir}/types/\\*\\*/\\*\\.ts",\\n\\s*"${escapedBuildDir}/dev/types/\\*\\*/\\*\\.ts"`,
        "g"
      ),
      '"**/*.mts"'
    )
    .replace(
      new RegExp(`,?\\n\\s*"${escapedBuildDir}/types/\\*\\*/\\*\\.ts"`, "g"),
      ""
    )
    .replace(
      new RegExp(`,?\\n\\s*"${escapedBuildDir}/dev/types/\\*\\*/\\*\\.ts"`, "g"),
      ""
  );

  if (after !== before) fs.writeFileSync("tsconfig.json", `${after.replace(/\n+$/, "")}\n`);
}
NODE
}

recover_pm2() {
  if [ "$PM2_WAS_STOPPED" != "true" ]; then
    return
  fi

  log "Deploy failed after PM2 stop; attempting safe recovery"

  if [ -f "$PREVIOUS_DIR/prerender-manifest.json" ]; then
    local failed_dir="${FAILED_DIR_PREFIX}-$(date -u +"%Y%m%d%H%M%S")"

    log "Restoring previous Next build from $PREVIOUS_DIR"
    if [ -d "$LIVE_DIR" ]; then
      mv "$LIVE_DIR" "$failed_dir" || true
    fi
    mv "$PREVIOUS_DIR" "$LIVE_DIR"

    if has_pm2_process; then
      pm2 restart "$APP_NAME" || true
    else
      pm2 resurrect || true
      pm2 restart "$APP_NAME" || true
    fi
    pm2 save || true
    rm -rf "$failed_dir"
    return
  fi

  if [ -f "$LIVE_DIR/prerender-manifest.json" ] && has_pm2_process; then
    pm2 restart "$APP_NAME" || true
    pm2 save || true
    return
  fi

  if [ -f "$LIVE_DIR/prerender-manifest.json" ]; then
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

log "Cleaning staging build"
rm -rf "$BUILD_DIR"

log "Building application into $BUILD_DIR"
NEXT_DIST_DIR="$BUILD_DIR" pnpm build
log "Build completed"
normalize_next_generated_files

verify_next_artifacts "$BUILD_DIR"

log "Stopping PM2 process for atomic build switch"
if has_pm2_process; then
  pm2 stop "$APP_NAME"
  PM2_WAS_STOPPED="true"
else
  log "PM2 process $APP_NAME does not exist yet"
fi

log "Switching build directories"
rm -rf "$PREVIOUS_DIR"
if [ -d "$LIVE_DIR" ]; then
  mv "$LIVE_DIR" "$PREVIOUS_DIR"
fi
mv "$BUILD_DIR" "$LIVE_DIR"
verify_next_artifacts "$LIVE_DIR"

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
