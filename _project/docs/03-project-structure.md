# Fixly.work Project Structure

## Current Project Structure

src/
  app/
    layout.tsx
    page.tsx
    [...serviceSlug]/
      page.tsx

  components/
    GoogleAnalytics.tsx

  features/

  lib/
    geo/
      markets.ts
      index.ts

    services/
      categories.ts
      subcategories.ts
      legacyRoutes.ts
      index.ts

    seo/
      templates.ts
      index.ts

    analytics.ts

  styles/
    variables.css
    globals.css
    typography.css
    layout.css
    buttons.css
    forms.css
    cards.css
    service-pages.css
    marketplace.css

_project/
  docs/
  snapshots/
  scripts/

## App Router Rules

Use Next.js App Router.

Pages live in:

src/app/

Shared business logic lives in:

src/lib/

Reusable components live in:

src/components/

Feature-specific components live in:

src/features/

## Geo Rule

All city, state, ZIP, market, and nearby-market data must come from:

src/lib/geo/

Do not hardcode city or state lists inside components.

## Services Rule

All service category and subcategory data must come from:

src/lib/services/

Do not duplicate service lists inside pages.

## SEO Rule

All SEO metadata helpers must live in:

src/lib/seo/

Pages should call SEO helpers instead of hardcoding title/description logic.