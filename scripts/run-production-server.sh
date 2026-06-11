#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_PORT="${PORT:-4081}"
NEXT_BIN="${NEXT_BIN:-./node_modules/.bin/next}"
STALE_GRACE_SECONDS="${STALE_GRACE_SECONDS:-5}"

log() {
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $*"
}

port_pids() {
  ss -ltnp "sport = :$APP_PORT" 2>/dev/null \
    | sed -n 's/.*pid=\([0-9]\+\).*/\1/p' \
    | sort -u
}

terminate_if_stale_fixly_server() {
  local pid="$1"
  local cwd=""
  local cmd=""

  if [ "$pid" = "$$" ] || [ ! -d "/proc/$pid" ]; then
    return
  fi

  cwd="$(readlink "/proc/$pid/cwd" 2>/dev/null || true)"
  if [ "$cwd" != "$APP_ROOT" ]; then
    log "Port $APP_PORT is held by pid $pid from $cwd; leaving it untouched"
    return
  fi

  cmd="$(tr '\0' ' ' <"/proc/$pid/cmdline" 2>/dev/null || true)"
  case "$cmd" in
    *next-server*|*"/next start"*|*"next start"*)
      log "Stopping stale Fixly server pid $pid on port $APP_PORT"
      kill -TERM "$pid" 2>/dev/null || true
      ;;
    *)
      log "Port $APP_PORT is held by pid $pid in $APP_ROOT but command is not a Next server; leaving it untouched"
      return
      ;;
  esac

  for _ in $(seq 1 "$STALE_GRACE_SECONDS"); do
    if ! kill -0 "$pid" 2>/dev/null; then
      return
    fi
    sleep 1
  done

  if kill -0 "$pid" 2>/dev/null; then
    log "Force-stopping stale Fixly server pid $pid"
    kill -KILL "$pid" 2>/dev/null || true
  fi
}

cd "$APP_ROOT"

for pid in $(port_pids); do
  terminate_if_stale_fixly_server "$pid"
done

unset NODE_APP_INSTANCE PM2_HOME PM2_USAGE instance_var km_link namespace \
  pm_cwd pm_err_log_path pm_exec_path pm_id pm_out_log_path pm_pid_path \
  pm_uptime unique_id

exec "$NEXT_BIN" start -p "$APP_PORT"
