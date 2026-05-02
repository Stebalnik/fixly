# Fixly.work Tech Stack

## Project Goal

Fixly.work is being rebuilt from a static service website into a React / Next.js hybrid platform:

- SEO service website
- home services lead marketplace
- public job/request pages
- registered pros can respond to requests

## Frontend

- Next.js App Router
- React
- TypeScript
- CSS Modules are not used
- Tailwind is not used
- Global centralized CSS system is used

## Styling

All styles are stored in:

src/styles/

Main files:

- variables.css
- globals.css
- typography.css
- layout.css
- buttons.css
- forms.css
- cards.css
- service-pages.css
- marketplace.css

## Backend

Current stage:

- no full backend yet
- marketplace backend will be added later
- likely future stack:
  - Next.js API routes
  - Supabase or similar database/auth
  - Stripe for payments if needed

## Analytics

Google Analytics 4 is connected.

Environment variables:

NEXT_PUBLIC_GA_ID=G-DDXNFSJE0H

Measurement Protocol secret must stay server-side only:

GA_MEASUREMENT_PROTOCOL_SECRET=

Never expose secret keys in frontend code.