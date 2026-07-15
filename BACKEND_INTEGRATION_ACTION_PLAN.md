# План работ для backend: подключение веб-консоли

Проверено 15.07.2026 по `MythicalCosmic/starforge_edu` и deployment
`https://starforge.78.111.91.113.nip.io`.

## Результат проверки

API v1 доступен по HTTPS, использует envelope `{success, data, pagination?}`
и opaque Bearer session key. Но deployment пока не готов к полноценному
browser live-flow: нет доступного тестового tenant-пользователя, CORS для
Vite-origin не настроен, а часть публичной документации расходится с кодом.

## P0 — блокирует live-подключение

### 1. Подготовить tenant и тестового пользователя

- Создать staging tenant с известным hostname и отдельным staff/director
  пользователем через штатный provisioning/management flow.
- Не публиковать пароль или session key в репозитории, `.env` или Vite build.
- Добавить smoke-test: login → `GET /api/v1/users/me/` →
  `GET /api/v1/students/` на одном hostname.

Причина: `scripts/seed_dev.py` создаёт пользователя для локального
`demo.localhost`; сессии tenant-bound, поэтому он не является учётной записью
удалённого `nip.io` deployment.

**Готово, когда:** login возвращает opaque `access`, а `/users/me/` и список
дают `200` на HTTPS-host конкретного tenant-а.

### 2. Настроить production CORS

- В staging добавить `http://localhost:5173` в `CORS_ALLOWED_ORIGINS`; добавить
  реальные preview/production origin-ы консоли по необходимости.
- Оставить строгий allowlist: не использовать wildcard или
  `CORS_ALLOW_ALL_ORIGINS` в production.
- Проверить OPTIONS для `Authorization`, `Content-Type`, `Accept-Language` и
  `X-Request-ID`, а также чтение JSON ошибок из браузера.

Причина: live preflight на `http://localhost:5173` отвечает `200`, но не
возвращает `Access-Control-Allow-Origin`. Код уже содержит поддержку
`CORS_ALLOWED_ORIGINS` в `config/settings/base.py`.

**Готово, когда:** preflight возвращает разрешённый конкретный Origin и
browser SPA читает 401/403 envelope.

### 3. Исправить HTTPS server URL в OpenAPI

- Убедиться, что production settings активны и reverse proxy передаёт
  доверенный `X-Forwarded-Proto: https` до Django.
- Добавить smoke/regression test на `servers[0].url` в `/api/schema/`.

Причина: live schema публикует `http://`, хотя API доступен по HTTPS. В
`core/openapi.py` URL строится из `request.scheme`; production settings уже
описывают `SECURE_PROXY_SSL_HEADER`.

**Готово, когда:** schema выдаёт `https://<tenant-host>` и generated client не
получает mixed-content redirect.

## P1 — единый и пригодный для клиентов контракт

### 4. Обновить README для реальной аутентификации

README описывает JWT `access + refresh`, а фактический код и
`agents/API-CONTRACT.md` используют один opaque access key с hard expiry семь
дней и без `/auth/refresh/`.

- Переписать README, curl-примеры и onboarding: `Authorization: Bearer
  <access>`, logout/re-login после 401, без refresh token и claims.
- Проверить соответствие login response в README, OpenAPI и тестах.

### 5. Типизировать OpenAPI DTO

- Описать request/response schema для students, teachers, cohorts, parents,
  org, payments, approvals, meetings, messaging и schedule.
- Указать required, enum, nullable, pagination, field errors и action routes.
- Добавить schema snapshot/contract test в CI.

Причина: сейчас `Success.data` и многие request body слишком обобщённые, что
не позволяет безопасно сгенерировать TypeScript/Dart клиент.

### 6. Зафиксировать единый денежный формат

- Выбрать публичный REST формат: decimal UZS строка **или** integer tiyin.
- Чётко отделить REST формат от Payme RPC, где tiyin обязателен.
- Синхронно обновить models/presenters, OpenAPI, README, fixtures и tests.

Причина: контракт упоминает tiyin, а `Payment.amount_uzs` и presenters
используют decimal UZS; без единого правила возможна ошибка в 100 раз.

## P2 — безопасно включить операции записи в консоли

### 7. Описать write-flow по каждому ресурсу

- Опубликовать точный endpoint, payload, lookup ID, validation/idempotency и
  response для каждого create/update/delete/action flow.
- Документировать специальные actions: cash payment, approvals actions,
  schedule cancel/move, messaging/meeting creation.
- Добавить e2e contract tests с role и branch scope.

Причина: legacy UI использует display-поля (`n`, `mgr`, label), а backend
требует DTO с ID и обязательными полями — например branch/contact у student и
branch/даты у cohort. Generic write нельзя включать до этих adapters/tests.

### 8. Закрепить release checklist

В CI/CD перед выкладкой проверять tenant hostname, HTTPS OpenAPI URL, CORS,
login/logout, `/users/me/`, один paginated list, `X-Request-ID`, role/branch
scope и денежный формат.

## Порядок выполнения

1. DevOps/backend owner: P0.1–P0.3.
2. Backend owner: P1.4–P1.6.
3. Backend + frontend: P2.7, включать write-flow по одному после contract/e2e
   test.
4. Release owner: P2.8.

## Ограничения безопасности

- Не ослаблять tenant binding сессий.
- Не включать wildcard CORS в production.
- Не класть реальные session key в Git, `.env` или `VITE_*` переменные.
