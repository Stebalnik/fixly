export { proxy as middleware } from "./proxy";

export const config = {
  matcher: [
    "/((?!api|sitemaps|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)",
  ],
};
