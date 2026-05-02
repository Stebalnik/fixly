# Fixly.work Routing and SEO

## Main SEO Strategy

Fixly.work must preserve the existing URL architecture from the old sitemap.

Old indexed URLs should continue working.

Examples:

- /
- /book/
- /services/
- /handyman/
- /plumbing/
- /cleaning/
- /electrical/
- /painting/
- /roofing/
- /kitchen-remodeling/
- /bathroom-remodeling/
- /roofing/roof-repair/
- /handyman/furniture-assembly/

## Legacy URL Handling

Legacy service routes are handled through:

src/lib/services/legacyRoutes.ts

Catch-all route:

src/app/[...serviceSlug]/page.tsx

This route reads the current path and maps it to:

- category page
- subcategory page
- future geo-aware page

## Services Page

General services catalog:

/services/

## Marketplace Flow

SEO service pages should guide users toward:

/book/

Future marketplace flow:

1. Visitor opens SEO service page.
2. Visitor clicks Request service.
3. Visitor submits request.
4. Request becomes a public job/request page.
5. Everyone can view public requests.
6. Only registered pros can respond.

## Indexing Rule

Use quality score logic from SEO templates:

qualityScore >= 80 → index
qualityScore < 80 → noindex

## Canonical Rule

Canonical URLs should preserve legacy paths when replacing old pages.

Do not accidentally canonical everything into /services/... if old URLs are already indexed.