# Global AI Request Generator

Generated: 2026-05-21

## Purpose

The Fixly synthetic request generator creates realistic, public-safe `service_requests` for marketplace liquidity and SEO testing. It now supports every country present in the geo market registry under `src/lib/geo/data/countries/`.

Current supported country codes are loaded dynamically from the geo index:

- `au`
- `ca`
- `gb`
- `nz`
- `us`

## Country Selection

Set `SERVICE_REQUEST_GENERATOR_COUNTRIES` to control where requests are generated.

Examples:

```bash
SERVICE_REQUEST_GENERATOR_COUNTRIES=all
SERVICE_REQUEST_GENERATOR_COUNTRIES=us,ca,gb,au,nz
SERVICE_REQUEST_GENERATOR_COUNTRIES=gb,au
```

Behavior:

- `all` enables every country in the geo registry.
- A comma-separated list enables only supported country codes.
- Unsupported country codes are skipped and logged in the agent run metadata.
- If the env var is missing, the generator falls back to `us` only.

## Volume Controls

Existing controls still apply:

```bash
SERVICE_REQUEST_GENERATOR_DAILY_MAX=75
SERVICE_REQUEST_GENERATOR_LIMIT=25
SERVICE_REQUEST_GENERATOR_LIMIT_PER_COUNTRY=10
SERVICE_REQUEST_GENERATOR_DAILY_MAX_PER_COUNTRY=25
SERVICE_REQUESTS_PER_TOPIC=3
```

- `SERVICE_REQUEST_GENERATOR_LIMIT` caps one run in global mode.
- `SERVICE_REQUEST_GENERATOR_DAILY_MAX` caps total synthetic requests per UTC day in global daily-cap mode.
- `SERVICE_REQUEST_GENERATOR_LIMIT_PER_COUNTRY` switches the run into per-country mode and applies that limit to each enabled country.
- `SERVICE_REQUEST_GENERATOR_DAILY_MAX_PER_COUNTRY` enforces a UTC daily cap separately for each country.
- `SERVICE_REQUESTS_PER_TOPIC` limits repeat generation for the same market/category/subcategory topic over the recent lookback.

Global mode example:

```bash
SERVICE_REQUEST_GENERATOR_COUNTRIES=all
SERVICE_REQUEST_GENERATOR_LIMIT=25
SERVICE_REQUEST_GENERATOR_DAILY_MAX=50
```

With `au`, `ca`, `gb`, `nz`, and `us` enabled, this creates up to 25 total requests, capped by the global daily maximum of 50 seeded requests.

Per-country mode example:

```bash
SERVICE_REQUEST_GENERATOR_COUNTRIES=all
SERVICE_REQUEST_GENERATOR_LIMIT_PER_COUNTRY=10
SERVICE_REQUEST_GENERATOR_DAILY_MAX_PER_COUNTRY=25
```

With `au`, `ca`, `gb`, `nz`, and `us` enabled, this creates up to 10 requests per country, up to 50 total, while allowing no country to exceed 25 seeded requests for the UTC day.

If `SERVICE_REQUEST_GENERATOR_LIMIT_PER_COUNTRY` is set but `SERVICE_REQUEST_GENERATOR_DAILY_MAX_PER_COUNTRY` is not set, the run still respects the existing global `SERVICE_REQUEST_GENERATOR_DAILY_MAX`.

## Distribution

For each run, the generator:

1. Loads enabled countries from geo data.
2. Calculates country quotas for the requested run size.
3. Gives each enabled country at least one slot when the run size allows it.
4. Weights remaining slots by the square root of each country market count.
5. Selects real markets from each country and valid service categories/subcategories.

This avoids sending the entire run to one country while still giving larger market datasets slightly more volume.

## Data Safety

Generated requests:

- Use real Fixly market slugs, city, state/region, and country code.
- Use valid category and subcategory slugs.
- Use `status = open` and `lead_status = available`.
- Set `archive_after`, `quality_score`, `index_status`, `purchase_count`, `max_purchases`, and seeded metadata.
- Never ask the model to create real names, phone numbers, emails, street names, or addresses.
- Clean generated public text to remove email-like strings and phone-like strings.

Private contact compatibility:

- The unlock flow requires a `request_contacts` row.
- The generator creates private synthetic contact rows only for newly inserted synthetic requests.
- Synthetic contacts use safe placeholder values such as `Synthetic Homeowner`, `example.invalid` email addresses, and non-real phone numbers.
- Public request pages must still read only from `service_requests` unless an authenticated pro has valid paid access.

## Duplicate Prevention

The generator avoids:

- Existing public slugs from recent seeded requests.
- Repeated description fingerprints from recent seeded requests.
- Repeating the same market/category/subcategory combination in a single run.
- Topics that already reached `SERVICE_REQUESTS_PER_TOPIC` in the recent seeded lookback.

Database `public_slug` conflict handling remains enabled as a final safety net.

## Logging

Each `ai_agent_runs.metadata.generationLog` includes:

- `countriesEnabled`
- `supportedCountries`
- `skippedCountries`
- `limitMode`
- `requestedCountryQuotas`
- `countryQuotas`
- `perCountryDailyMax`
- `skippedDailyMaxByCountry`
- `marketsSampled`
- `requestsCreatedByCountry`
- `skippedReasons`
- `errorsByCountry`

The API response also returns country quotas, created counts by country, and skipped reasons.

## Safe Run

Use the internal route with the existing bearer token:

```bash
curl -X POST \
  -H "Authorization: Bearer $INTERNAL_AI_AGENT_TOKEN" \
  https://fixly.work/api/internal/ai-agents/generate-service-requests
```

For a controlled global run:

```bash
SERVICE_REQUEST_GENERATOR_COUNTRIES=all
SERVICE_REQUEST_GENERATOR_LIMIT=25
SERVICE_REQUEST_GENERATOR_DAILY_MAX=50
SERVICE_REQUESTS_PER_TOPIC=1
```

For a controlled per-country run:

```bash
SERVICE_REQUEST_GENERATOR_COUNTRIES=all
SERVICE_REQUEST_GENERATOR_LIMIT_PER_COUNTRY=10
SERVICE_REQUEST_GENERATOR_DAILY_MAX_PER_COUNTRY=25
SERVICE_REQUESTS_PER_TOPIC=1
```

Run low volume first in staging and verify public request pages, pro unlock behavior, and contact privacy before increasing production volume.
