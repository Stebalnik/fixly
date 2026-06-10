# SEO Growth Sync Plan

This plan keeps category expansion, Georgia coverage, AI agents, and lead alerts aligned without changing the existing SEO intent machine.

## Goals

- Grow service coverage through existing category, subcategory, intent, geo, sitemap, and generated-page systems.
- Prioritize appliances, HVAC, and handyman first.
- Give Georgia extra coverage across all services, with higher priority for Atlanta, Savannah, Columbus, Athens, Sandy Springs, Augusta, Macon, Marietta, Roswell, and Alpharetta.
- Notify operators in Telegram only after a real customer request and contact details are saved.
- Keep pro monetization tied to available paid leads and unlock behavior.

## Required Environment

- `INTERNAL_AI_AGENT_TOKEN`: protects internal AI agent endpoints.
- `TELEGRAM_BOT_TOKEN`: Telegram bot token. Keep this server-side only.
- `TELEGRAM_LEADS_CHAT_ID`: chat, group, or channel id for new lead alerts.
- `TELEGRAM_MINI_APP_URL`: optional mini app URL. Defaults to `/telegram/leads`.
- `NEXT_PUBLIC_SITE_URL`: canonical public site URL used by scripts and alerts.
- LLM/Search data envs from `.env.example` for Search Console, BigQuery, and draft generation.

## Daily Agent Loop

Run the SEO growth orchestrator on a schedule:

```bash
cd /var/www/fixly-web
./scripts/run-seo-growth-orchestrator.sh
```

Suggested cron:

```cron
15 */6 * * * cd /var/www/fixly-web && ./scripts/run-seo-growth-orchestrator.sh >> /var/log/fixly-seo-growth.log 2>&1
```

The orchestrator currently runs:

1. Search Console ingestion
2. BigQuery trends ingestion
3. SEO opportunity generation
4. Internal SEO expansion
5. Draft generation
6. Sitemap awareness
7. Auto-publish generated pages

## First-Wave Category Coverage

The campaign focus is declared in `src/lib/seo/campaigns.ts`.

Appliances:

- refrigerator and freezer repair
- washer and dryer repair and installation
- dishwasher repair and installation
- oven, range, and stove repair and installation
- microwave installation and repair
- garbage disposal repair and installation
- ice maker and water line installation
- dryer vent cleaning and repair
- appliance installation
- appliance troubleshooting
- appliance maintenance

HVAC:

- AC repair
- HVAC repair
- emergency HVAC repair
- AC installation and replacement
- furnace repair
- furnace installation and replacement
- heat pump repair and installation
- mini split installation
- ductwork repair and installation
- HVAC maintenance and tune-up
- thermostat installation and repair
- indoor air quality
- HVAC inspection and troubleshooting
- commercial HVAC service

Handyman:

- TV mounting
- furniture assembly
- drywall repair and patching
- door repair and installation
- window repair
- shelving and wall mounting
- curtain and blinds installation
- picture and mirror hanging
- small carpentry repairs
- general home repairs
- grab bar installation
- caulking and sealing
- fixture and hardware installation
- closet system installation
- weatherstripping installation
- mailbox installation
- gate and fence hardware repair
- deck and patio minor repairs
- baby proofing installation

## Lead Signal Loop

Real lead alerts are sent from `src/app/api/requests/route.ts` only after:

- public request row is created
- private contact row is saved
- category, market, description, phone, and email pass validation

Telegram failure is logged but does not block lead creation.

## Weekly Review

Every week, check:

- `/account/admin/ai-ops` for agent runs, generated pages, and rejected pages
- Search Console clicks and impressions by category, subcategory, intent, and Georgia market
- valid request count by source page
- pro unlock rate by category and market
- zero-conversion pages that get clicks but no form starts or leads

The next scaling step is to add conversion events for form starts, valid leads, and lead unlocks so SEO traffic can be optimized by revenue instead of clicks only.
