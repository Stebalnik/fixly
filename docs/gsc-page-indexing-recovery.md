# GSC Page Indexing Recovery

Fixly tracks Google Search Console Page Indexing issues through a manual/semi-automated import flow because the public Search Console API does not expose a bulk Page Indexing/Coverage URL export endpoint. Operators export or copy URLs from individual Page Indexing reason detail screens, import them into `gsc_url_issues`, and let the audit agent re-check live status and classify safe next actions.

## Import URLs

In Google Search Console, open **Indexing > Pages**, choose a reason such as **Not found (404)**, then copy or export the affected URLs from that reason detail screen. Import one reason at a time when possible so every URL receives the correct `normalized_reason`.

JSON URL list:

```bash
curl -X POST "https://fixly.work/api/internal/ai-agents/gsc-page-indexing-import" \
  -H "Authorization: Bearer $INTERNAL_AI_AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Не найдено (404)",
    "urls": ["https://fixly.work/us/ky/blandville/plumbing"]
  }'
```

JSON rows with per-row reasons:

```json
{
  "rows": [
    {
      "url": "https://fixly.work/us/ga/buford/plumbing/unknown-service",
      "reason": "Not found (404)"
    }
  ]
}
```

Plain text, one URL per line:

```bash
curl -X POST "https://fixly.work/api/internal/ai-agents/gsc-page-indexing-import?reason=Not%20found%20(404)" \
  -H "Authorization: Bearer $INTERNAL_AI_AGENT_TOKEN" \
  -H "Content-Type: text/plain" \
  --data-binary $'https://fixly.work/us/ky/blandville/plumbing\n'
```

CSV/TSV import accepts URL columns named `URL`, `Page`, `Страница`, `Адрес`, `url`, or `page`, and reason columns named `Reason`, `Status`, `Причина`, `reason`, or `status`.

## Reason Normalization

Imported GSC reasons are normalized to stable values:

- `not_found_404`
- `server_error_5xx`
- `page_with_redirect`
- `redirect_error`
- `duplicate_without_user_canonical`
- `duplicate_google_chose_different_canonical`
- `alternate_page_with_canonical`
- `noindex`
- `crawled_currently_not_indexed`
- `discovered_currently_not_indexed`
- `unknown`

## Audit

The cron-safe audit endpoint is:

```bash
curl -X POST "https://fixly.work/api/internal/ai-agents/gsc-url-issue-audit" \
  -H "Authorization: Bearer $INTERNAL_AI_AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "openIssueLimit": 25,
    "searchAnalyticsLimit": 0,
    "generatedPageLimit": 0,
    "inspectLimit": 5,
    "createOpportunities": false
  }'
```

Manual import is not part of cron. Cron should only re-audit existing open `gsc_url_issues`.

## Safe Actions

Allowed automatic action:

- `missing_ai_generated_page`: create an `ai_seo_opportunities` row only when the market, service, and intent pass existing rules. Publishing still requires the existing draft, quality review, and publish pipeline.

Recorded-only actions:

- `missing_market`: `geo_review_required`
- `missing_service_route`: review legacy route or redirect
- `server_error`: `check_logs`
- `noindex`: `check_metadata_robots`
- `canonical_duplicate`: `check_canonical`
- `redirect`: `check_redirect`
- `should_410`: review intentional removal or redirect

Do not auto-add cities, auto-publish pages, or mass-create routes from imported GSC errors. Missing markets and ambiguous services require manual review.
