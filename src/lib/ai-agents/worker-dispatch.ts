import { spawn } from "child_process";
import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  statSync,
  unlinkSync,
} from "fs";
import path from "path";
import type { AiAgentJobName } from "./worker-jobs";

const LOCK_DIR = "/tmp/fixly-ai-agents";
const DEFAULT_LOCK_MAX_AGE_MS = 12 * 60 * 60 * 1000;

export type AiAgentDispatchResult = {
  ok: true;
  queued: boolean;
  job: AiAgentJobName;
  pid?: number;
  alreadyRunning?: boolean;
  logFile?: string;
};

export function getAiAgentLockPath(job: AiAgentJobName) {
  return path.join(LOCK_DIR, `${job}.lock`);
}

export function clearStaleAiAgentLock(job: AiAgentJobName) {
  const lockPath = getAiAgentLockPath(job);
  if (!existsSync(lockPath)) return false;

  if (isAiAgentLockActive(lockPath)) return false;

  unlinkSync(lockPath);
  return true;
}

export function dispatchAiAgentJob(job: AiAgentJobName): AiAgentDispatchResult {
  const cwd = process.cwd();
  const lockPath = getAiAgentLockPath(job);

  clearStaleAiAgentLock(job);

  if (existsSync(lockPath)) {
    return {
      ok: true,
      queued: false,
      job,
      alreadyRunning: true,
    };
  }

  mkdirSync(LOCK_DIR, { recursive: true });

  const logsDir = path.join(cwd, "logs", "ai-agents");
  mkdirSync(logsDir, { recursive: true });

  const logFile = path.join(
    logsDir,
    `${job}-${new Date().toISOString().replace(/[:.]/g, "-")}.log`
  );
  const out = openSync(logFile, "a");
  const err = openSync(logFile, "a");

  const child = spawn(
    path.join(cwd, "node_modules", ".bin", "tsx"),
    ["scripts/ai-agent-worker.ts", job],
    {
      cwd,
      detached: true,
      env: {
        ...process.env,
        FIXLY_AI_AGENT_JOB_SOURCE: "http",
      },
      stdio: ["ignore", out, err],
    }
  );

  child.unref();
  closeSync(out);
  closeSync(err);

  return {
    ok: true,
    queued: true,
    job,
    pid: child.pid,
    logFile,
  };
}

function isAiAgentLockActive(lockPath: string) {
  const pid = Number(readFileSync(lockPath, "utf8").split(/\s+/)[0]);

  if (Number.isInteger(pid) && pid > 0 && isProcessRunning(pid)) {
    return true;
  }

  const maxAgeMs = getLockMaxAgeMs();
  const ageMs = Date.now() - statSync(lockPath).mtimeMs;

  return ageMs < maxAgeMs && !Number.isInteger(pid);
}

function isProcessRunning(pid: number) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function getLockMaxAgeMs() {
  const configured = Number(process.env.FIXLY_AI_AGENT_LOCK_MAX_AGE_MS);

  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_LOCK_MAX_AGE_MS;
}
