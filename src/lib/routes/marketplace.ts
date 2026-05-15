export function getRequestsPath(countryCode?: string | null) {
  const country = countryCode?.trim().toLowerCase();

  if (!country) {
    return "/us/requests";
  }

  return `/${country}/requests`;
}

export function getRequestPublicPath(
  publicSlug: string,
  countryCode?: string | null
) {
  const country = countryCode?.trim().toLowerCase();

  if (!country) {
    return `/us/requests/${publicSlug}`;
  }

  return `/${country}/requests/${publicSlug}`;
}