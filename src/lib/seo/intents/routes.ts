import { getServiceIntentBySlug } from "./registry";

export function parseServiceIntentPath(serviceSlug: string[]) {
  const maybeIntentSlug = serviceSlug.at(-1);
  const intent = getServiceIntentBySlug(maybeIntentSlug);

  if (!intent) {
    return {
      routePath: serviceSlug.join("/"),
      intent: null,
    };
  }

  return {
    routePath: serviceSlug.slice(0, -1).join("/"),
    intent,
  };
}