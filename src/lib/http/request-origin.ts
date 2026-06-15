function firstForwardedValue(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

export function getRequestOrigin(request: Request) {
  const proto =
    firstForwardedValue(request.headers.get("x-forwarded-proto")) ?? "https";
  const host =
    firstForwardedValue(request.headers.get("x-forwarded-host")) ??
    firstForwardedValue(request.headers.get("host"));

  if (host) {
    return `${proto}://${host}`;
  }

  return new URL(request.url).origin;
}
