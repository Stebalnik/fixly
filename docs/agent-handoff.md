# Agent Handoff Log

Этот файл нужен, чтобы следующий агент мог продолжить задачу после compacted context, ошибки чата или перехода в новый чат.

## Как пользоваться

- Перед началом работы прочитать этот файл вместе с `AGENTS.md`.
- После значимых изменений добавить новую запись сверху в раздел "Журнал изменений".
- Писать кратко, но достаточно конкретно: что изменено, зачем, какие файлы затронуты, что проверено, что осталось сделать.
- Не переносить сюда секреты, токены, приватные ключи и содержимое `.env*`.
- Если задача не закончена, явно оставить блок "Следующие шаги".

## Формат записи

```md
### YYYY-MM-DD HH:MM UTC - Короткое название

Контекст:
- Что пользователь попросил или какую проблему решали.

Изменения:
- `path/to/file`: что изменено и зачем.

Проверка:
- Какая команда запускалась и результат.
- Если проверка не запускалась, почему.

Следующие шаги:
- Что нужно сделать дальше, если задача не завершена.
```

## Журнал изменений

### 2026-06-17 03:17 UTC - Исправление shared auth cookies для pro login

Контекст:
- Пользователь сообщил, что login больше не работает: после нажатия login его возвращает на `Pro login required`, то есть `/pro` не видит серверную Supabase-сессию.
- В production logs повторяется `refresh_token_not_found`; дополнительная причина найдена в cross-subdomain flow: login может выполняться на `fixly.work`, а затем редирект уходит на `pro.fixly.work`, куда host-only Supabase cookie не передаётся.

Изменения:
- `src/lib/auth/supabaseCookieOptions.ts`: добавлен общий helper для Supabase cookie options; для `fixly.work` и поддоменов выставляет shared cookie domain `.fixly.work`, для localhost/domain вне Fixly оставляет host-only.
- `src/lib/auth/supabaseCookies.ts`: добавлены request-aware cookie options, применение Supabase cache-control headers, расширенная очистка `sb-*` cookies как host-only, так и domain-scoped (`.fixly.work` / текущий host domain).
- `src/app/api/auth/login/route.ts`, `src/app/api/pro/signup/route.ts`, `src/app/api/auth/after-login/route.ts`, `src/app/api/auth/logout/route.ts`, `src/app/api/account/header-state/route.ts`, `src/lib/auth/account.ts`: server Supabase clients используют shared cookie options; stale cookies чистятся шире.
- `proxy.ts`: middleware/proxy теперь пишет Supabase cookie mutations с теми же options/headers и чистит stale auth cookies при `refresh_token_not_found`.
- `src/lib/supabase/browser.ts`: browser Supabase client теперь тоже ставит `.fixly.work` cookies на корневом домене и поддоменах.

Проверка:
- Прочитаны локальные Next 16 docs по Route Handlers, cookies и Authentication перед изменениями.
- `NODE_OPTIONS='--max-old-space-size=4096' pnpm exec tsc --noEmit --pretty false` успешно.
- `NODE_OPTIONS='--max-old-space-size=4096' pnpm build` успешно.
- `git diff --check` успешно.

Следующие шаги:
- Закоммитить/запушить auth-cookie fix, выполнить production deploy.
- После deploy проверить `/api/health`, затем smoke login временным pro-пользователем на `https://fixly.work` -> `https://pro.fixly.work`, убедиться что `/pro` больше не показывает `Pro login required`, и удалить временного пользователя.

### 2026-06-16 02:32 UTC - Stabilize GSC import, auth cookies, and Groq JSON

Контекст:
- Пользователь попросил исправить три production-проблемы: Cloudflare 504/`ERR_SSL_PACKET_LENGTH_TOO_LONG` в GSC admin import, login flow requiring a second attempt because of stale Supabase refresh cookies, and `service_request_generator_agent` Groq JSON failures caused by unescaped inch quotes.

Изменения:
- `src/app/api/account/admin/gsc-page-indexing-import/route.ts`, `src/app/api/account/admin/gsc-url-issue-audit/route.ts`: убран HTTP self-fetch to internal routes; admin routes now require admin and call server-side agent functions directly.
- `src/lib/ai-agents/gsc-url-issue-route-options.ts`: добавлен общий parser для GSC import/audit route requests; audit limits default to 100 and clamp at 500; import parser forces import-only options.
- `src/app/api/internal/ai-agents/gsc-page-indexing-import/route.ts`, `src/app/api/internal/ai-agents/gsc-url-issue-audit/route.ts`: internal bearer-protected routes reuse the shared parser while keeping internal auth.
- `src/lib/ai-agents/gsc-url-issue-audit-agent.ts`: page indexing import no longer performs live HTTP checks or creates SEO opportunities; it only normalizes/upserts issues and returns quickly. Audit candidate/open issue limits are capped.
- `src/features/account/GscPageIndexingImportPanel.tsx`: import success message now says to run audit next; audit button uses 100-item batches instead of 1000.
- `src/lib/auth/supabaseCookies.ts`: added shared helpers for Supabase cookie detection, stale-cookie clearing, and applying cookie mutations.
- `src/lib/auth/account.ts`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/after-login/route.ts`, `src/app/api/auth/logout/route.ts`, `src/app/api/account/header-state/route.ts`, `src/app/api/pro/signup/route.ts`: Supabase cookie mutations are applied in responses where possible; stale `refresh_token_not_found` cookies are cleared; successful login/signup clears old `sb-*` cookies before setting the new session.
- `src/lib/llm/provider.ts`: Groq JSON generation now prefers `json_schema` structured outputs for supported/opted-in models, retries JSON validation failures once, and repairs malformed JSON once before failing with a clear error.
- `src/lib/ai-agents/request-generator-agent.ts`: prompt now explicitly forbids malformed JSON/raw inch quotes; generated request payload is validated before insert.
- `docs/agent-handoff.md`: added this entry.

Проверка:
- Прочитаны локальные Next 16 docs по Route Handlers, Redirecting, and cookies перед изменениями.
- Проверены official Groq docs: `json_schema` structured outputs are preferred where supported; `json_object` remains older JSON mode.
- `NODE_OPTIONS='--max-old-space-size=4096' pnpm exec tsc --noEmit --pretty false` успешно.
- `pnpm build` успешно; build output includes the GSC/admin/auth/internal routes.
- `git diff --check` успешно.
- `timeout 150s env NODE_OPTIONS='--max-old-space-size=4096' pnpm lint` timed out with no diagnostics; lint inconclusive.

Следующие шаги:
- После deploy выполнить smoke: `/api/health`, admin login once to `/login?next=/account/admin/ai-ops`, upload a small GSC export, confirm import returns quickly, then run a 100-item audit.
- Real browser login was not tested because no production/test credentials were provided.

### 2026-06-15 21:40 UTC - Fix admin GSC proxy auth and first-login redirect

Контекст:
- Пользователь попросил исправить две production-проблемы: 401/token mismatch при GSC Page Indexing import/audit и login flow, где пользователь выглядел залогиненным только со второй попытки.
- Важные требования: не раскрывать `INTERNAL_AI_AGENT_TOKEN` в browser, дать ясную диагностику missing token vs unauthorized, сохранить `next` redirect, и закоммитить/запушить изменения.

Изменения:
- `src/lib/ai-agents/internal-auth.ts`: добавлен общий helper для bearer auth AI-agent endpoints; env var строго `INTERNAL_AI_AGENT_TOKEN`, header format `Authorization: Bearer <token>`, missing token теперь возвращает 500 с безопасным текстом.
- `src/app/api/internal/ai-agents/*/route.ts`: bearer-protected AI-agent routes переведены на общий helper; `gsc-url-issue-audit` дополнительно принимает `limit` как alias для `candidateLimit/openIssueLimit`.
- `src/app/api/account/admin/gsc-page-indexing-import/route.ts`, `src/app/api/account/admin/gsc-url-issue-audit/route.ts`, `src/lib/http/request-origin.ts`: admin proxy routes требуют admin, берут token только server-side, строят absolute origin из forwarded headers/host, forward body/content-type/query, и возвращают internal status/body без generic wrapping.
- `src/app/api/account/admin/ai-agent-env-check/route.ts`: новый admin-only env check без раскрытия token value.
- `src/features/account/GscPageIndexingImportPanel.tsx`: UI использует только admin proxy endpoints и показывает endpoint/status/response JSON or text при ошибках.
- `scripts/gsc-import-page-indexing.sh`: новый CLI helper для root/server import; сам грузит `.env.local`/`.env`, поддерживает `--text-url` и `--file` (`csv/tsv/txt`, включая Cyrillic filenames), не печатает token.
- `src/app/api/auth/login/route.ts`, `src/lib/auth/postLogin.ts`: новый server-side password login route; Supabase sign-in выполняется на сервере, cookies пишутся в response, redirect target считается после login с safe `next` and admin-path guard.
- `src/app/api/auth/after-login/route.ts`, `src/app/login/page.tsx`, `src/features/auth/LoginForm.tsx`, `src/features/pro/ProLoginForm.tsx`, `src/components/HeaderAuthMenu.tsx`: login forms переведены на `/api/auth/login`, fallback after-login показывает явную session error, header state fetch явно включает credentials.
- `docs/agent-handoff.md`: добавлена эта запись.

Проверка:
- Прочитаны локальные Next 16 docs по Route Handlers, Authentication, Redirecting перед изменениями.
- `NODE_OPTIONS='--max-old-space-size=4096' pnpm exec tsc --noEmit --pretty false` успешно.
- `pnpm build` успешно; build output содержит новые routes `/api/auth/login` and `/api/account/admin/ai-agent-env-check`.
- `git diff --check` успешно.
- `bash -n scripts/gsc-import-page-indexing.sh` успешно.
- `timeout 150s env NODE_OPTIONS='--max-old-space-size=4096' pnpm lint` завершился по timeout без diagnostics; lint result inconclusive.
- Full browser login with real credentials не проверялся, потому что в задаче не были предоставлены test credentials.

Следующие шаги:
- Закоммитить и запушить `fixly: fix admin GSC import proxy and login redirect flow`.
- После deploy проверить `/login?next=/account/admin/ai-ops` под admin credentials и импорт через `/account/admin/ai-ops`; для CLI smoke можно использовать `bash scripts/gsc-import-page-indexing.sh --reason "Not found (404)" --text-url "https://fixly.work/us/ky/blandville/plumbing"`.

### 2026-06-15 14:28 UTC - Admin UI для GSC Page Indexing import

Контекст:
- Пользователь попросил добавить простой internal UI в `/account/admin/ai-ops`, чтобы admin мог загрузить CSV/TSV/TXT export из Google Search Console Page Indexing reason detail page, импортировать URLs в `gsc_url_issues`, затем запустить audit open issues.
- Важное требование: не раскрывать `INTERNAL_AI_AGENT_TOKEN` в browser client; внутренние bearer-protected endpoints должны остаться защищёнными.

Изменения:
- `src/app/api/account/admin/gsc-page-indexing-import/route.ts`: новый admin-only proxy route; проверяет admin через `requireAdminUser()`, читает raw text body, сохраняет content-type/query reason, server-side вызывает internal import endpoint с bearer token.
- `src/app/api/account/admin/gsc-url-issue-audit/route.ts`: новый admin-only proxy route; принимает `{ "limit": 1000 }`, проверяет admin, server-side вызывает internal audit endpoint с bearer token и маппит limit в `candidateLimit/openIssueLimit`.
- `src/features/account/GscPageIndexingImportPanel.tsx`: новый client component с reason dropdown, file input `.csv/.tsv/.txt`, textarea для pasted URLs, FileReader import, loading/error states, import/audit summaries, и `Run audit now` после import.
- `src/app/account/admin/ai-ops/page.tsx`: добавлена секция/card `GSC Page Indexing Import` перед existing recovery list.
- `docs/agent-handoff.md`: добавлена эта запись.

Проверка:
- Прочитаны локальные Next 16 docs по Route Handlers и Server/Client Components перед изменениями.
- `NODE_OPTIONS='--max-old-space-size=4096' pnpm exec tsc --noEmit --pretty false` успешно.
- `pnpm build` успешно; новые routes `/api/account/admin/gsc-page-indexing-import` и `/api/account/admin/gsc-url-issue-audit` присутствуют в build output.
- `git diff --check` успешно.
- `timeout 150s env NODE_OPTIONS='--max-old-space-size=4096' pnpm lint` завершился по timeout без diagnostics; lint result inconclusive.

Следующие шаги:
- Закоммитить и запушить с сообщением `fixly: add GSC indexing import admin UI`.
- После deploy проверить `/account/admin/ai-ops` under admin session: upload small GSC CSV, import, then run audit.

### 2026-06-15 04:01 UTC - Завершён GSC Page Indexing recovery workflow

Контекст:
- Пользователь попросил продолжить задачу после сбоя предыдущей сессии и закончить систему импорта/классификации/безопасного восстановления GSC Page Indexing issues.
- Важное ограничение сохранено: Search Console API не используется как bulk Coverage export; URL импортируются из manual/csv/plaintext exports reason detail screens.

Изменения:
- `supabase/migrations/20260615033715_gsc_page_indexing_recovery_schema.sql`: forward-migration для `gsc_url_issues`: добавлены `normalized_url`, `gsc_reason`, `normalized_reason`, `root_cause`, inspection/canonical fields, `action_payload`; `proposed_action` переведён в text action name с сохранением старого JSON payload; добавлены unique/indexes по normalized URL/reason/status/root cause/etc.
- `src/lib/ai-agents/gsc-url-issue-audit-agent.ts`: импорт и аудит переведены на stable GSC reasons (`not_found_404`, `server_error_5xx`, canonical/noindex/crawl states), normalized URL upsert key, root-cause классификацию (`missing_market`, `missing_service_route`, `missing_ai_generated_page`, `valid_route_but_http_404`, `server_error`, `redirect`, `noindex`, `canonical_duplicate`, `crawled_not_indexed`, `discovered_not_indexed`, `should_410`, `unknown`), open issue batch collection, reason inheritance для manual URL re-audit, safe opportunity creation only for `missing_ai_generated_page`.
- `src/app/api/internal/ai-agents/gsc-page-indexing-import/route.ts`: endpoint принимает JSON `{reason, urls}`, JSON `{rows}`, text/plain, CSV/TSV; распознаёт URL/Page/Страница/Адрес and Reason/Status/Причина/Статус; добавлен `allowExternal`.
- `src/app/api/internal/ai-agents/gsc-url-issue-audit/route.ts`: endpoint принимает `issueIds`, `openIssueLimit`, `allowExternal`.
- `src/app/account/admin/ai-ops/page.tsx`: добавлена GSC Page Indexing Recovery секция с фильтрами, списком issues, server-action re-audit selected/latest open, и curl import example.
- `docs/gsc-page-indexing-recovery.md`: добавлен runbook по импорту, reason normalization, audit curl, safe/manual actions.

Проверка:
- Прочитаны локальные Next 16 docs по Route Handlers и Server Actions/Forms перед изменениями.
- `NODE_OPTIONS='--max-old-space-size=4096' pnpm exec tsc --noEmit --pretty false` успешно.
- `pnpm build` успешно после финальных изменений.
- `git diff --check` успешно.
- `pnpm lint` запускался с 4GB heap, но не дал вывода около 2.5 минут и был остановлен; lint result inconclusive.
- Миграция `20260615033715_gsc_page_indexing_recovery_schema.sql` применена точечно через `psql` и отмечена в `schema_migrations` (полный `pnpm db:migrate` не запускался из-за ранее известной старой pending migration risk).
- Dev server `next dev -p 4084`: JSON import `{"reason":"Не найдено (404)","urls":["https://fixly.work/us/ky/blandville/plumbing"]}` успешен; plain text import with `?reason=Не найдено (404)` успешен; CSV `URL,Status` import успешен; single URL audit успешен. Stored row: `not_found_404|missing_market|missing_market|open|geo_review_required`.

Следующие шаги:
- Закоммитить и запушить изменения.
- Production deploy: `bash deploy.sh`, затем smoke `https://fixly.work/api/health` and internal import/audit endpoints with low limits.
- После deploy проверить `/account/admin/ai-ops` as admin and next cron audit logs.

### 2026-06-15 03:17 UTC - Production rollout GSC URL issue audit

Контекст:
- После коммита `5173d4e` нужно было выкатить новый GSC URL issue audit agent в production и включить регулярный запуск.

Изменения:
- Production deploy выполнен через `bash deploy.sh`; PM2 process `fixly-web` перезапущен на новой `.next` сборке.
- Root crontab: добавлен ежедневный запуск `POST http://localhost:4081/api/internal/ai-agents/gsc-url-issue-audit` в `04:02 Europe/London`, лог в `/var/log/fixly-ai-agents.log`.
- Код не менялся после deploy; `tsconfig.json` был возвращён к чистому состоянию после форматирования Next build.

Проверка:
- Deploy build успешен: Next compiled, TypeScript в build прошёл, static pages generated.
- Deploy health check прошёл; local `/api/health` отвечает `200`, public `https://fixly.work/api/health` отвечает `200`.
- Production smoke test нового endpoint с URL `https://fixly.work/us/ky/blandville/plumbing` и лимитами `candidateLimit=1`, `searchAnalyticsLimit=0`, `generatedPageLimit=0`, `inspectLimit=0`, `createOpportunities=false` успешен: `issuesFound=1`, `issueTypeCounts.missing_market=1`.

Следующие шаги:
- Через следующий cron-run проверить `/var/log/fixly-ai-agents.log` и новые rows в `gsc_url_issues`.
- Если нужно авточинить `missing_market`, отдельно добавить безопасный geo-review workflow: не добавлять города в geo index без валидации источника/населения/ближайшего canonical market.

### 2026-06-15 03:12 UTC - Добавлен GSC URL issue audit agent

Контекст:
- Пользователь спросил, можно ли на текущей базе сделать агента, который проверяет ошибки Google Search Console и помогает чинить 404/индексационные проблемы.
- Важное ограничение: публичный Search Console API не отдаёт массовый Page indexing/Coverage report списком; доступны Search Analytics, Sitemaps, Sites и URL Inspection по конкретному URL. Поэтому агент собирает URL-кандидаты из Search Analytics page rows, опубликованных generated pages и ручного списка URL.

Изменения:
- `supabase/migrations/20260615031000_gsc_url_issues.sql`: добавлена таблица `gsc_url_issues` для URL issues, HTTP/GSC статусов, классификации, proposed action и связи с SEO opportunity.
- `src/lib/ai-agents/gsc-url-issue-audit-agent.ts`: новый агент собирает кандидаты, проверяет production HTTP status, опционально вызывает URL Inspection, классифицирует `missing_market`, `missing_service_route`, `invalid_intent`, HTTP/GSC fetch issues и пишет/обновляет `gsc_url_issues`. Для безопасных `missing_service_route` кейсов может создать `ai_seo_opportunities`; для `missing_market` только фиксирует issue/proposed action.
- `src/app/api/internal/ai-agents/gsc-url-issue-audit/route.ts`: новый internal POST endpoint с bearer auth и JSON options (`urls`, `candidateLimit`, `searchAnalyticsLimit`, `generatedPageLimit`, `inspectLimit`, `createOpportunities`).
- `src/lib/ai-agents/orchestrators/seo-growth-orchestrator.ts`: orchestrator теперь включает этап `gsc_url_issue_audit` после `search_console_ingest`.

Проверка:
- Прочитаны локальные Next 16 docs по Route Handlers/Proxy перед изменениями.
- Проверены официальные Google docs: Search Console API даёт Search Analytics/Sitemaps/Sites/URL Inspection; URL Inspection работает по конкретному URL.
- `NODE_OPTIONS='--max-old-space-size=4096' pnpm exec tsc --noEmit --pretty false` успешно.
- `git diff --check` успешно.
- `pnpm lint` был запущен с 4GB heap, но долго не выдавал прогресса и был остановлен; полной lint-проверки нет.
- Миграция `20260615031000_gsc_url_issues.sql` применена точечно через `psql` и отмечена в `schema_migrations`. Полный `pnpm db:migrate` сейчас блокируется старой pending-миграцией `20260601191500_material_listings.sql`, которую safety scanner считает destructive.
- Временный `next dev -p 4083` с production env: POST `/api/internal/ai-agents/gsc-url-issue-audit` на `https://fixly.work/us/ky/blandville/plumbing` с лимитами `candidateLimit=1`, `searchAnalyticsLimit=0`, `generatedPageLimit=0`, `inspectLimit=0`, `createOpportunities=false` вернул `issuesFound=1`, `issueTypeCounts.missing_market=1`; в `gsc_url_issues` есть `missing_market|high|open|/us/ky/blandville/plumbing`.

Следующие шаги:
- Закоммитить/запушить код, затем выполнить production deploy.
- После deploy добавить root cron для `/api/internal/ai-agents/gsc-url-issue-audit` между Search Console ingest и остальным SEO pipeline.

### 2026-06-13 02:20 UTC - Перезапуск PM2 с актуальными AI/GSC env

Контекст:
- Пользователь уточнил, что Google Search Console refresh token был обновлён вчера, и попросил перепроверить/перезапустить.

Изменения:
- Production PM2 process `fixly-web` перезапущен с env из `.env.production` через `pm2 restart fixly-web --update-env`; `pm2 save` выполнен.
- Код не менялся.

Проверка:
- Прямой Google Search Console API check с `.env.production` успешен: `rows=1`, период `2026-05-28`–`2026-06-11`.
- PM2 env теперь содержит `INTERNAL_AI_AGENT_TOKEN`, `GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN`, `NODE_OPTIONS=--max-old-space-size=4096`.
- Local `/api/health` и public `https://fixly.work/api/health` отвечают `ok`.
- Internal endpoint `/api/internal/ai-agents/search-console-ingest` успешно отработал через cron-style bearer auth: `signalsCreated=250`, период `2026-05-28`–`2026-06-11`.

Следующие шаги:
- Если снова появятся `Unauthorized` в `/var/log/fixly-ai-agents.log`, проверить, не был ли PM2 перезапущен без env из `.env.production`.

### 2026-06-12 03:17 UTC - Production deploy публичных request metric fixes

Контекст:
- Пользователь проверил `https://fixly.work/requests` и увидел старые `FIXAs`/`pros purchased` для незалогиненных пользователей, потому что предыдущий коммит был запушен, но production ещё отдавал старую `.next` сборку.

Изменения:
- `src/app/requests/[requestSlug]/page.tsx`: дополнительно убран гостевой client component payload `priceFixas`; для гостей и logged-in non-pro теперь рендерится server-side CTA Link, а `UnlockLeadButton` с ценой рендерится только для pro.
- Production: выполнен `bash deploy.sh` после коммитов `bd837fa` и `bcce0cc`; PM2 `fixly-web` online, текущий HEAD `bcce0cc`.

Проверка:
- `pnpm exec tsc --noEmit --pretty false` успешно для дополнительной правки.
- `bash deploy.sh` успешно, local/public `/api/health` отвечают `200`.
- `https://fixly.work/requests` проверен без cache-busting: нет `FIXAs`, `pros purchased`, `Low competition`, `Highest price`, `Lowest competition`, `price-high`, `competition`.
- Adelaide public request detail проверен: нет `FIXAs`, `pros purchased`, `Job access price`, `Purchased:`, `priceFixas`, schema `Offer`, `priceCurrency`.

Следующие шаги:
- Если пользователь всё ещё видит старый UI, проверить browser/CDN cache; origin уже отдаёт новую разметку.

### 2026-06-12 02:48 UTC - Скрыты FIXA-метрики на публичных request pages

Контекст:
- Пользователь попросил проверить авторазвитие страниц по Google Search Console и убрать с публичных страниц для незарегистрированных пользователей стоимость в FIXAs и количество ответивших/купивших pros.

Изменения:
- `src/app/requests/page.tsx`: с публичного списка `/requests` убраны отображение FIXAs, `pros purchased`, badge/фильтр/sort по competition/price; поля цены больше не выбираются из Supabase для этой страницы.
- `src/app/requests/[requestSlug]/page.tsx`: `Job access price` и `Purchased` показываются только owner/pro-контексту; для гостя цена не передаётся в `UnlockLeadButton` и не попадает в JSON-LD `Offer`.
- Проверка AI Ops: env-переменные для GSC/AI-agent присутствуют в `.env.production`; cron настроен на ежедневные Search Console/BigQuery/opportunity/draft/publish этапы; в базе есть 335 published generated pages. В `/var/log/fixly-ai-agents.log` после прежних успешных запусков видны повторяющиеся `invalid_grant` для Search Console и `Invalid API key` для части AI/LLM этапов, поэтому GSC-цепочка сейчас требует обновления credentials/API key.

Проверка:
- `pnpm exec tsc --noEmit --pretty false` успешно.
- `git diff --check` успешно.
- `pnpm lint` был запущен, но остановлен вручную после долгого отсутствия вывода; полной lint-проверки нет.
- Dev server `pnpm exec next dev -p 4082`: гостевой HTML `/requests` не содержит `FIXAs`, `pros purchased`, price/competition sort; гостевой HTML Adelaide request не содержит `FIXAs`, `Job access price`, `Purchased:`, `priceFixas`, schema `Offer`.

Следующие шаги:
- Обновить Google Search Console refresh token, потому что cron/log показывает `invalid_grant`.
- Проверить/обновить AI provider key для draft/publish этапов, потому что cron/log показывает `Invalid API key`.
- После обновления секретов вручную прогнать весь AI Ops pipeline малым объёмом и проверить новые `ai_agent_runs`.

### 2026-06-11 21:01 UTC - Стабилизация Fixly под bot/SEO flood

Контекст:
- `fixly-web` снова падал в health alerts: PM2 был `errored`, `/api/health` на `127.0.0.1:4081` не отвечал, restart spike рос.
- Диагностика показала два слоя: orphan `next-server` держал порт `4081`, а при старте за nginx на origin мгновенно приходила лавина тяжелых SEO/sitemap URL (`/gb/...`, `/nz/...`, `/sitemaps/*/intents/*.xml`), после чего Next 16 уходил в CPU loop и переставал отвечать даже на health.

Изменения:
- `scripts/run-production-server.sh`: добавлен guarded production start. Перед `next start` он убирает только stale Next-процессы Fixly, которые держат порт, и очищает PM2 env-переменные как старый ручной запуск.
- `deploy.sh`: новый PM2 start путь использует wrapper; normalization теперь правит `required-server-files.json` и `required-server-files.js`, чтобы staging `NEXT_DIST_DIR` не оставался зашитым в live `.next`.
- Live `.next/required-server-files.{json,js}` нормализованы на сервере к `distDir: ".next"`.
- Вне репозитория: `/etc/nginx/sites-available/fixly.work` добавлены 410 для legacy-heavy `/au|ca|gb|nz|sg/` и numbered `/sitemaps/{au,ca,gb,nz,sg,us}/intents/*.xml`, плюс origin rate limit; `/etc/nginx/conf.d/fixly-cache.conf` добавлен `limit_req_zone`.
- Вне репозитория: `/root/fixly-doctor/src/check.mjs` обновлен, чтобы repair/rebuild нормализовал Next runtime manifests и стартовал `scripts/run-production-server.sh` с runtime heap.
- PM2 process list сохранен через `pm2 save`; `server-health-bot.timer` снова включен.

Проверка:
- `nginx -t` успешно, `systemctl reload nginx` успешно.
- `bash -n scripts/run-production-server.sh deploy.sh` успешно.
- `node --check /root/fixly-doctor/src/check.mjs` успешно.
- После controlled `pm2 restart fixly-web --update-env`: local `/api/health` отвечал `200` за ~0.012s, public `/api/health` за ~0.033s; через ~85 секунд local health отвечал `200` за ~0.017s, PM2 был `online`, upstream established к `4081` был `0`.
- `fixly-doctor` check-only видел PM2 online и HTTP ok; оставшаяся finding `address-in-use` была из старых PM2 логов до фикса.

Следующие шаги:
- Разобрать, какие SEO routes/sitemaps надо вернуть безопасно, и делать это через controlled rollout с throttling/cache, а не открывать весь generated URL-space на origin.
- Если alerts повторятся, сначала смотреть nginx access log на новые path patterns, которые обходят текущий 410-фильтр.

### 2026-06-11 18:47 UTC - Откат unstable SEO/FIXA пакета из production

Контекст:
- После коммита `d2ff3eb` production `fixly-web` начал зависать: `/api/health` иногда отвечал один раз после deploy, затем `next-server (v16.2.4)` уходил в ~100% CPU, а последующие health checks получали timeout/fetch failed.
- Логи PM2 показывали OOM и Next runtime/prerender cache errors для market SEO routes.
- Возврат `generateStaticParams() { return []; }` в `2bd74dd` улучшил build output, но не устранил runtime CPU lock.

Изменения:
- Созданы revert-коммиты для `2bd74dd` и `d2ff3eb`, чтобы вернуть `main` к последней стабильной базе после `52e5ac3`.
- Сохранены инструкции `AGENTS.md` и этот handoff-файл из `52e5ac3`.
- На сервер временно добавлен swap `/swapfile-fixly-build` 4G, потому что clean build во время диагностики был убит OOM killer.
- Live `.next` восстановлен из `.next-doctor-previous-20260611180452`, последней preserved-сборки перед unstable deploy.
- PM2 `fixly-web` перезапущен с `NODE_OPTIONS=--max-old-space-size=4096` и сохранен через `pm2 save`.
- `deploy.sh` обновлен, чтобы будущие restart/start/recovery пути тоже задавали runtime `NODE_OPTIONS` через `RUNTIME_NODE_OPTIONS`.

Проверка:
- `NEXT_DIST_DIR=.next-build-hotfix pnpm build` для partial hotfix проходил, но runtime все равно зависал, поэтому выбран откат.
- После restore + runtime heap limit: `/robots.txt`, `/`, `/api/health` отвечали быстро; повторная проверка через ~30 секунд показала `/api/health` около `0.01s`, `/robots.txt` около `0.01s`, `/` около `0.18s`.
- PM2 metrics после стабилизации: event loop latency около `0.69ms`, HTTP mean latency около `33ms`.

Следующие шаги:
- Разбирать `d2ff3eb` по частям в отдельной ветке, начиная с dynamic market SEO routes и Next 16 prerender/runtime cache behavior.

### 2026-06-10 20:00 UTC - Добавлено правило push в GitHub

Контекст:
- Пользователь попросил настроить процесс так, чтобы агент пушил изменения в GitHub.

Изменения:
- `AGENTS.md`: добавлено правило GitHub push workflow: после завершения работы коммитить и пушить изменения текущей задачи, если есть GitHub remote и пользователь не запретил.
- `docs/agent-handoff.md`: добавлена запись о новом git-процессе.

Проверка:
- Проверены текущая ветка `main`, remote `origin` на `git@github.com:Stebalnik/fixly.git`, git user.name и user.email.

Следующие шаги:
- Закоммитить и запушить документационные изменения в `origin/main`.

### 2026-06-10 19:55 UTC - Создан handoff-журнал для агентов

Контекст:
- Пользователь попросил завести файл, куда агенты будут записывать изменения с объяснениями, чтобы после compacted context или перехода в новый чат можно было продолжить задачу.

Изменения:
- `docs/agent-handoff.md`: создан журнал с правилами ведения, шаблоном записи и первой записью.
- `AGENTS.md`: добавлена инструкция читать и обновлять этот журнал.

Проверка:
- Тесты не запускались, потому что изменена только документация.

Следующие шаги:
- При следующих задачах обновлять этот файл после значимых изменений и особенно перед завершением незаконченной работы.
