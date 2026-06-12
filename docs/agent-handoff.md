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
