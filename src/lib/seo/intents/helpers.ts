import type { ServiceIntent } from "./types";

export function isIndexableIntent(intent?: ServiceIntent | null) {
  return Boolean(intent?.indexable);
}

export function isHighPriorityIntent(intent?: ServiceIntent | null) {
  return intent?.priority === 1;
}

export function isMediumPriorityIntent(intent?: ServiceIntent | null) {
  return intent?.priority === 2;
}

export function isLowPriorityIntent(intent?: ServiceIntent | null) {
  return intent?.priority === 3;
}

export function getIntentPriorityScore(intent?: ServiceIntent | null) {
  if (!intent) return 0;

  if (intent.priority === 1) return 100;
  if (intent.priority === 2) return 50;

  return 10;
}

export function sortIntentsByPriority<T extends ServiceIntent>(intents: T[]) {
  return [...intents].sort((a, b) => {
    return getIntentPriorityScore(b) - getIntentPriorityScore(a);
  });
}