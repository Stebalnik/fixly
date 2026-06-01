function buildPublicUrl(baseUrl: string, path = "/") {
  const url = new URL(baseUrl);
  const pathUrl = new URL(path.startsWith("/") ? path : `/${path}`, url.origin);

  url.pathname = pathUrl.pathname;
  url.search = pathUrl.search;
  url.hash = pathUrl.hash;

  return url.toString();
}

export function getMainSiteUrl(path = "/") {
  return buildPublicUrl(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://fixly.work",
    path
  );
}

export function getProSiteUrl(path = "/") {
  return buildPublicUrl(
    process.env.NEXT_PUBLIC_PRO_SITE_URL ?? "https://pro.fixly.work",
    path
  );
}

export function getMaterialsSiteUrl(path = "/") {
  return buildPublicUrl(
    process.env.NEXT_PUBLIC_MATERIALS_SITE_URL ??
      "https://materials.fixly.work",
    path
  );
}
