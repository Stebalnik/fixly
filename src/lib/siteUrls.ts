function buildPublicUrl(baseUrl: string, path = "/") {
  const url = new URL(baseUrl);

  url.pathname = path.startsWith("/") ? path : `/${path}`;
  url.search = "";
  url.hash = "";

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
