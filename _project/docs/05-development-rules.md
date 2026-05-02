# Fixly.work Development Rules

## General Rules

- Keep architecture simple.
- Do not duplicate data.
- Do not hardcode services, cities, states, or SEO strings inside components.
- Use TypeScript types.
- Keep components readable and small.
- Keep business data in src/lib.
- Keep visual styling in src/styles.

## AI Assistant Rules

When AI helps with this project, it must first respect these files:

- _project/docs/01-tech-stack.md
- _project/docs/02-design-system.md
- _project/docs/03-project-structure.md
- _project/docs/04-routing-and-seo.md
- _project/docs/05-development-rules.md

AI must not assume Tailwind is used.

AI must not create random one-off design systems.

AI must preserve legacy SEO URLs.

AI must use:

- src/lib/geo for geo
- src/lib/services for services
- src/lib/seo for SEO metadata
- src/styles for design

## Code Style

Prefer:

- small reusable helpers
- typed data structures
- simple components
- centralized CSS classes

Avoid:

- inline styles
- duplicated service arrays
- duplicated city arrays
- hardcoded metadata
- large page files with repeated logic

## Snapshot Rule

Before major changes, run the project context snapshot script.

The snapshot should capture:

- current folder structure
- important source files
- project docs
- package.json
- current architecture overview

Snapshots are saved into:

_project/snapshots/