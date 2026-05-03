# Global SEO Marketplace Strategy (Fixly)

## 1. Core Vision

Fixly is not just a local services website.

Fixly is a **global SEO-first marketplace** designed to:

- capture high-intent search traffic
- convert visitors into service requests
- connect them with local professionals
- scale across countries without paid acquisition

Primary goal:

> Build the largest organic entry layer for home services globally.

---

## 2. Growth Model

Fixly grows through:

```txt
Geo × Category × Subcategory × Intent

Example:

/us/ga/buford/handyman/tv-mounting
/us/ga/buford/plumbing/leak-detection-repair
/us/ga/buford/plumbing/leak-detection-repair/same-day
/us/ga/buford/plumbing/leak-detection-repair/price

This creates exponential SEO coverage.

3. Page Types
3.1 Category Pages

Example:

/handyman
/plumbing
/electrical

Purpose:

act as traffic hubs
distribute internal link weight
target broad keywords

Structure:

Hero (H1 + CTA)
Subcategories grid
Popular searches
Use cases / services overview
Price guidance
FAQ
Nearby cities
Related categories
3.2 Subcategory Pages

Example:

/plumbing/leak-detection-repair
/handyman/tv-mounting

Purpose:

capture high-intent service searches
convert users into requests

Structure:

Hero (city + service)
Service description
Included items
Price factors
When to hire a pro
Local SEO paragraphs
FAQ
CTA

Content is generated via:

src/lib/seo/servicePageSections.ts
src/lib/seo/overrides/*
3.3 Intent Pages (High Priority)

Example:

/plumbing/leak-detection-repair/same-day
/plumbing/leak-detection-repair/price
/plumbing/leak-detection-repair/near-me

Purpose:

capture long-tail queries
increase page count and traffic
target conversion-focused intent

Key intents:

same-day
emergency
price
cheap
near-me
4. Content Strategy

Content is NOT written manually per page.

Content is generated via:

templates
structured data
overrides per subcategory

Key principles:

match user intent
include real search phrases
provide actionable information
include pricing signals
include FAQs
5. SEO System Architecture
5.1 Data Sources
Services: src/lib/services
Geo: src/lib/geo
SEO logic: src/lib/seo
5.2 Overrides
src/lib/seo/overrides/
  handyman.ts
  plumbing.ts
  electrical.ts

Rules:

override key === subcategory.slug
each override enriches SEO content
6. Internal Linking Strategy

Every page must link to:

parent category
subcategories
related services
nearby cities
intent variations

Goal:

Build a dense internal link graph for faster indexing and ranking.

7. Geo Expansion Strategy

Fixly is built for global scale.

Structure:

/country/region/city/service

Geo data must be centralized in:

src/lib/geo

Pages must reuse the same logic across all locations.

8. Marketplace Model

Fixly operates as:

request-first platform
users submit requests
pros respond

Key principles:

no browsing friction
fast request creation
clear service description
9. Monetization Strategy
cost per lead: $1–5
instant lead unlock
scalable pricing by region

Focus:

maximize volume, not margin per lead

10. Key Competitive Advantage

Fixly competes by:

massive SEO coverage
structured page generation
low-cost lead acquisition
fast global expansion

Not by:

paid ads
brand marketing
manual operations
11. Indexing Strategy

Pages should be indexed when:

they have sufficient content depth
include geo + service + intent
include FAQ and internal links

Avoid:

thin pages
duplicate content
empty geo pages
12. Execution Principles
Build once → scale globally
Centralize logic → avoid duplication
Automate page generation
Focus on high-intent queries
Always optimize for conversion
13. Next Steps
Expand all categories (plumbing, electrical, cleaning)
Add intent pages
Improve internal linking
Add structured data (schema)
Expand geo coverage
Final Statement

Fixly is designed to become:

The global organic entry point for local services.

Scale comes from:

structure
automation
intent coverage
and execution speed