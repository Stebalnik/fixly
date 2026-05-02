# Fixly.work Design System

## Core Principle

Design must be centrally controlled.

Do not hardcode colors, spacing, fonts, shadows, radiuses, or repeated layout values directly inside components.

Components should use reusable CSS classes and variables.

## CSS Source of Truth

All styling lives in:

src/styles/

## Design Tokens

Main design tokens are stored in:

src/styles/variables.css

Brand colors:

--color-primary: #1F6FB5;
--color-primary-dark: #0A2E5C;
--color-primary-light: #E6F1FB;
--color-accent: #2EA3FF;
--color-bg: #F4F8FC;
--color-surface: #FFFFFF;
--color-border: #D9E2EC;
--color-text-main: #111827;
--color-text-muted: #4B5563;

## Typography

Typography rules must be centralized in:

src/styles/typography.css

Components should not define one-off font sizes unless absolutely necessary.

Use semantic structure:

- h1
- h2
- h3
- p
- small
- .eyebrow
- .hero-text

## Layout

Reusable layout classes live in:

src/styles/layout.css

Current key classes:

- .container
- .container-narrow
- .section
- .section-sm
- .grid-2
- .grid-3
- .grid-4
- .flex
- .flex-center
- .flex-between
- .gap-sm
- .gap-md
- .gap-lg

## Cards

Reusable card styles live in:

src/styles/cards.css

Current key classes:

- .card
- .card-hover
- .card-flat
- .card-icon
- .badge
- .badge-primary
- .badge-success
- .badge-warning
- .badge-danger

## Buttons

Reusable button styles live in:

src/styles/buttons.css

Expected button classes:

- .button
- .button-primary
- .button-secondary
- .button-outline
- .button-danger

## Development Rule

When creating a new page or component:

1. First check existing CSS classes.
2. Reuse existing tokens and classes.
3. If a new pattern is repeated more than once, add it to a shared CSS file.
4. Avoid inline styles.
5. Avoid hardcoded colors.
6. Avoid duplicated spacing values.