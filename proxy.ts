import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

const publicProRoutes = ["/pro/signup", "/pro/onboarding", "/pro/login"];
const staticPathPrefixes = ["/_next", "/api", "/sitemaps"];
const staticPathnames = ["/favicon.ico", "/robots.txt", "/sitemap.xml"];
const mainSiteRoutes = [
  "/accessibility",
  "/book",
  "/cookie-policy",
  "/lead-policy",
  "/privacy-policy",
  "/refund-policy",
  "/requests",
  "/safety-policy",
  "/services",
  "/terms-of-service",
];

function isPublicProRoute(pathname: string) {
  return publicProRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isStaticOrApiPath(pathname: string) {
  return (
    staticPathnames.includes(pathname) ||
    staticPathPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )
  );
}

function getRequestHost(request: NextRequest) {
  return (
    request.headers.get("host") ??
    request.headers.get("x-forwarded-host") ??
    ""
  )
    .split(":")[0]
    .toLowerCase();
}

function getProHost() {
  return new URL(process.env.NEXT_PUBLIC_PRO_SITE_URL ?? "https://pro.fixly.work")
    .host.split(":")[0]
    .toLowerCase();
}

function getMaterialsHost() {
  return new URL(
    process.env.NEXT_PUBLIC_MATERIALS_SITE_URL ?? "https://materials.fixly.work"
  )
    .host.split(":")[0]
    .toLowerCase();
}

function getMainHost() {
  return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://fixly.work").host
    .split(":")[0]
    .toLowerCase();
}

function isProHost(host: string) {
  return host === getProHost();
}

function isMainHost(host: string) {
  const mainHost = getMainHost();

  return host === mainHost || host === `www.${mainHost}`;
}

function isMaterialsHost(host: string) {
  return host === getMaterialsHost();
}

function getProInternalPath(pathname: string) {
  if (pathname === "/") return "/pro";
  if (pathname === "/pro" || pathname.startsWith("/pro/")) return pathname;
  return `/pro${pathname}`;
}

function buildProExternalUrl(pathname: string, search: string) {
  const proBase = new URL(
    process.env.NEXT_PUBLIC_PRO_SITE_URL ?? "https://pro.fixly.work"
  );
  const externalPath =
    pathname === "/pro"
      ? "/"
      : pathname.startsWith("/pro/")
        ? pathname.slice(4)
        : pathname;

  proBase.pathname = externalPath || "/";
  proBase.search = search;

  return proBase;
}

function buildMainExternalUrl(pathname: string, search: string) {
  const mainBase = new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://fixly.work"
  );

  mainBase.pathname = pathname || "/";
  mainBase.search = search;

  return mainBase;
}

function buildMaterialsExternalUrl(pathname: string, search: string) {
  const materialsBase = new URL(
    process.env.NEXT_PUBLIC_MATERIALS_SITE_URL ?? "https://materials.fixly.work"
  );

  materialsBase.pathname =
    pathname === "/materials"
      ? "/"
      : pathname.startsWith("/materials/")
        ? pathname.slice("/materials".length)
        : pathname;
  materialsBase.search = search;

  return materialsBase;
}

function isMainSiteRoute(pathname: string) {
  return mainSiteRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = getRequestHost(request);
  const requestIsProHost = isProHost(host);
  const requestIsMainHost = isMainHost(host);
  const requestIsMaterialsHost = isMaterialsHost(host);

  if (
    (requestIsProHost || requestIsMaterialsHost) &&
    isMainSiteRoute(pathname)
  ) {
    return NextResponse.redirect(buildMainExternalUrl(pathname, search), 308);
  }

  if (
    requestIsMainHost &&
    (pathname === "/materials" || pathname.startsWith("/materials/"))
  ) {
    return NextResponse.redirect(buildMaterialsExternalUrl(pathname, search), 308);
  }

  if (requestIsMaterialsHost && !isStaticOrApiPath(pathname)) {
    return rewriteIfNeeded(request, "/materials");
  }

  if (requestIsMainHost && (pathname === "/pro" || pathname.startsWith("/pro/"))) {
    return NextResponse.redirect(buildProExternalUrl(pathname, search), 308);
  }

  if (requestIsProHost && !isStaticOrApiPath(pathname)) {
    if (pathname === "/pro" || pathname.startsWith("/pro/")) {
      return NextResponse.redirect(buildProExternalUrl(pathname, search), 308);
    }

    return handleProRequest(request, getProInternalPath(pathname));
  }

  const isProRoute = pathname === "/pro" || pathname.startsWith("/pro/");

  if (!isProRoute) {
    return NextResponse.next();
  }

  return handleProRequest(request, pathname);
}

async function handleProRequest(request: NextRequest, internalPathname: string) {
  const { pathname, search } = request.nextUrl;

  if (isPublicProRoute(internalPathname)) {
    return rewriteIfNeeded(request, internalPathname);
  }

  let response = rewriteIfNeeded(request, internalPathname);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = rewriteIfNeeded(request, internalPathname);

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectUrl = request.nextUrl.clone();

    redirectUrl.pathname = "/login";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("intent", "pro");
    redirectUrl.searchParams.set("next", `${pathname}${search}`);

    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

function rewriteIfNeeded(request: NextRequest, internalPathname: string) {
  const rewriteUrl = request.nextUrl.clone();

  if (rewriteUrl.pathname === internalPathname) {
    return NextResponse.next({
      request,
    });
  }

  rewriteUrl.pathname = internalPathname;

  return NextResponse.rewrite(rewriteUrl, {
    request,
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)",
  ],
};
