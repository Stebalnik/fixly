# Fixly Project Context Snapshot

Generated: Mon May  4 13:37:58 EDT 2026
Project root: /Users/aliaksandrstsebikhau/www/fixly-web
Export folder: _project/exports/archive/2026-05-04_13-37-58

## 1. Project purpose

Fixly.work is a Next.js home services SEO website and lead marketplace.
The platform has SEO service pages, geo-aware pages, a /book request flow, public request pages, and Supabase-backed lead storage.

## 2. Directory tree
```txt
.
./_project
./_project/docs
./_project/scripts
./_project/snapshots
./_project/snapshots/archive
./src
./src/app
./src/app/[...serviceSlug]
./src/app/[country]
./src/app/[country]/[region]
./src/app/[country]/[region]/[market]
./src/app/[country]/[region]/[market]/[...serviceSlug]
./src/app/api
./src/app/api/requests
./src/app/api/requests/[id]
./src/app/api/requests/[id]/contact
./src/app/book
./src/app/requests
./src/app/requests/[requestSlug]
./src/app/services
./src/components
./src/features
./src/features/booking
./src/features/services
./src/features/services/category-pages
./src/lib
./src/lib/geo
./src/lib/geo/data
./src/lib/geo/us
./src/lib/seo
./src/lib/seo/overrides
./src/lib/services
./src/lib/services/legacyRoutes
./src/lib/services/subcategories
./src/lib/supabase
./src/styles
```

## 3. File list
```txt
./_project/docs/01-tech-stack.md
./_project/docs/02-design-system.md
./_project/docs/03-project-structure.md
./_project/docs/04-routing-and-seo.md
./_project/docs/05-development-rules.md
./_project/docs/06-global-seo-marketplace-strategy.md
./_project/scripts/collect-project-context.mjs
./_project/scripts/export-project-context.sh
./_project/scripts/generate-us-cities.mjs
./_project/snapshots/archive/fixly-project-snapshot-2026-04-25.txt
./_project/snapshots/archive/fixly-project-snapshot-2026-04-25T17-12-28-230Z.txt
./_project/snapshots/fixly-project-snapshot-2026-04-25.txt
./.env.example
./.env.local
./.gitignore
./AGENTS.md
./CLAUDE.md
./eslint.config.mjs
./next-env.d.ts
./next.config.ts
./package.json
./pnpm-lock.yaml
./pnpm-workspace.yaml
./README.md
./src/app/[...serviceSlug]/page.tsx
./src/app/[country]/[region]/[market]/[...serviceSlug]/page.tsx
./src/app/api/requests/[id]/contact/route.ts
./src/app/api/requests/route.ts
./src/app/book/page.tsx
./src/app/layout.tsx
./src/app/page.module.css
./src/app/page.tsx
./src/app/requests/[requestSlug]/page.tsx
./src/app/requests/page.tsx
./src/app/robots.ts
./src/app/services/page.tsx
./src/app/sitemap.ts
./src/components/Breadcrumbs.tsx
./src/components/Footer.tsx
./src/components/GoogleAnalytics.tsx
./src/components/PublicPageShell.tsx
./src/components/SiteHeader.tsx
./src/features/booking/BookRequestForm.tsx
./src/features/services/category-pages/AppliancesCategoryPage.tsx
./src/features/services/category-pages/AwningsCategoryPage.tsx
./src/features/services/category-pages/CleaningCategoryPage.tsx
./src/features/services/category-pages/ElectricalCategoryPage.tsx
./src/features/services/category-pages/FenceCategoryPage.tsx
./src/features/services/category-pages/FlooringCategoryPage.tsx
./src/features/services/category-pages/GarageCategoryPage.tsx
./src/features/services/category-pages/HandymanCategoryPage.tsx
./src/features/services/category-pages/HvacCategoryPage.tsx
./src/features/services/category-pages/JunkCategoryPage.tsx
./src/features/services/category-pages/LawnCategoryPage.tsx
./src/features/services/category-pages/MaintenanceCategoryPage.tsx
./src/features/services/category-pages/MovingCategoryPage.tsx
./src/features/services/category-pages/PaintingCategoryPage.tsx
./src/features/services/category-pages/PestCategoryPage.tsx
./src/features/services/category-pages/PlumbingCategoryPage.tsx
./src/features/services/category-pages/PressureCategoryPage.tsx
./src/features/services/category-pages/RemodelingCategoryPage.tsx
./src/features/services/category-pages/RoofingCategoryPage.tsx
./src/features/services/category-pages/SolarCategoryPage.tsx
./src/features/services/ServicePageTemplate.tsx
./src/lib/analytics.ts
./src/lib/geo/data/us-cities.seed.json
./src/lib/geo/index.ts
./src/lib/geo/markets.ts
./src/lib/geo/types.ts
./src/lib/geo/us/ loadUsMarkets.ts
./src/lib/geo/us/createUsMarket.ts
./src/lib/geo/us/ga.ts
./src/lib/geo/us/index.ts
./src/lib/geo/us/types.ts
./src/lib/geo/utils.ts
./src/lib/seo/breadcrumbs.ts
./src/lib/seo/categoryContent.ts
./src/lib/seo/content.ts
./src/lib/seo/index.ts
./src/lib/seo/overrides/appliances.ts
./src/lib/seo/overrides/awnings.ts
./src/lib/seo/overrides/cleaning.ts
./src/lib/seo/overrides/electrical.ts
./src/lib/seo/overrides/fence.ts
./src/lib/seo/overrides/flooring.ts
./src/lib/seo/overrides/garage.ts
./src/lib/seo/overrides/handyman.ts
./src/lib/seo/overrides/hvac.ts
./src/lib/seo/overrides/junk.ts
./src/lib/seo/overrides/lawn.ts
./src/lib/seo/overrides/maintenance.ts
./src/lib/seo/overrides/moving.ts
./src/lib/seo/overrides/painting.ts
./src/lib/seo/overrides/pest.ts
./src/lib/seo/overrides/plumbing.ts
./src/lib/seo/overrides/pressure.ts
./src/lib/seo/overrides/remodeling.ts
./src/lib/seo/overrides/roofing.ts
./src/lib/seo/overrides/solar.ts
./src/lib/seo/schema.ts
./src/lib/seo/serviceContentOverrides.ts
./src/lib/seo/servicePageSections.ts
./src/lib/seo/templates.ts
./src/lib/services/categories.ts
./src/lib/services/index.ts
./src/lib/services/legacyRoutes.old.ts
./src/lib/services/legacyRoutes/appliances.ts
./src/lib/services/legacyRoutes/awnings.ts
./src/lib/services/legacyRoutes/cleaning.ts
./src/lib/services/legacyRoutes/core.ts
./src/lib/services/legacyRoutes/electrical.ts
./src/lib/services/legacyRoutes/fence.ts
./src/lib/services/legacyRoutes/flooring.ts
./src/lib/services/legacyRoutes/garage.ts
./src/lib/services/legacyRoutes/handyman.ts
./src/lib/services/legacyRoutes/hvac.ts
./src/lib/services/legacyRoutes/index.ts
./src/lib/services/legacyRoutes/junk.ts
./src/lib/services/legacyRoutes/lawn.ts
./src/lib/services/legacyRoutes/maintenance.ts
./src/lib/services/legacyRoutes/misc.ts
./src/lib/services/legacyRoutes/moving.ts
./src/lib/services/legacyRoutes/painting.ts
./src/lib/services/legacyRoutes/pest.ts
./src/lib/services/legacyRoutes/plumbing.ts
./src/lib/services/legacyRoutes/pressure.ts
./src/lib/services/legacyRoutes/propertyMaintenance.ts
./src/lib/services/legacyRoutes/remodeling.ts
./src/lib/services/legacyRoutes/roofing.ts
./src/lib/services/legacyRoutes/solar.ts
./src/lib/services/legacyRoutes/types.ts
./src/lib/services/subcategories/appliances.ts
./src/lib/services/subcategories/awnings.ts
./src/lib/services/subcategories/cleaning.ts
./src/lib/services/subcategories/electrical.ts
./src/lib/services/subcategories/fence.ts
./src/lib/services/subcategories/flooring.ts
./src/lib/services/subcategories/garage.ts
./src/lib/services/subcategories/handyman.ts
./src/lib/services/subcategories/hvac.ts
./src/lib/services/subcategories/index.ts
./src/lib/services/subcategories/junk.ts
./src/lib/services/subcategories/lawn.ts
./src/lib/services/subcategories/maintenance.ts
./src/lib/services/subcategories/moving.ts
./src/lib/services/subcategories/painting.ts
./src/lib/services/subcategories/pest.ts
./src/lib/services/subcategories/plumbing.ts
./src/lib/services/subcategories/pressure.ts
./src/lib/services/subcategories/remodeling.ts
./src/lib/services/subcategories/roofing.ts
./src/lib/services/subcategories/solar.ts
./src/lib/services/types.ts
./src/lib/supabase/client.ts
./src/styles/buttons.css
./src/styles/cards.css
./src/styles/forms.css
./src/styles/globals.css
./src/styles/layout.css
./src/styles/marketplace.css
./src/styles/service-pages.css
./src/styles/typography.css
./src/styles/variables.css
./tsconfig.json
```

## 4. App routes
```txt
./src/app/[...serviceSlug]/page.tsx
./src/app/[country]/[region]/[market]/[...serviceSlug]/page.tsx
./src/app/api/requests/[id]/contact/route.ts
./src/app/api/requests/route.ts
./src/app/book/page.tsx
./src/app/layout.tsx
./src/app/page.tsx
./src/app/requests/[requestSlug]/page.tsx
./src/app/requests/page.tsx
./src/app/robots.ts
./src/app/services/page.tsx
./src/app/sitemap.ts
```

## 5. Package.json
```json
{
  "name": "fixly-web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 4081",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "snapshot": "node _project/scripts/collect-project-context.mjs",
    "export:context": "bash _project/scripts/export-project-context.sh",
    "geo:generate": "node _project/scripts/generate-us-cities.mjs"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.104.1",
    "next": "16.2.4",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.4",
    "typescript": "^5"
  }
}
```

## 6. Important config files
```txt
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
tsconfig.json
next.config.ts
eslint.config.mjs
.gitignore
AGENTS.md
CLAUDE.md
README.md
```

## 7. Project docs
```txt
_project/docs/01-tech-stack.md
_project/docs/02-design-system.md
_project/docs/03-project-structure.md
_project/docs/04-routing-and-seo.md
_project/docs/05-development-rules.md
_project/docs/06-global-seo-marketplace-strategy.md
```
