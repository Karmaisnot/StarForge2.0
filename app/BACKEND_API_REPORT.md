# Отчёт по интеграции backend API

Проверено 14.07.2026 против `MythicalCosmic/starforge_edu`, commit
`13955e9c121276582d5d6f1e9fe9d274f67cd424` от 13.07.2026, и доступного
развёртывания `starforge.78.111.91.113.nip.io`.

## Найдено

### 1. Критично — OpenAPI публикует HTTP вместо HTTPS

`GET https://starforge.78.111.91.113.nip.io/api/schema/` возвращает в
`servers[0].url` адрес с `http://`. Реальный запрос на этот HTTP-адрес отвечает
`308 Permanent Redirect` на HTTPS. Для сгенерированных клиентов это неверный
base URL, а HTTPS-фронтенд в браузере заблокирует такой запрос как mixed content
до редиректа.

Вероятная точка: `core/openapi.py:337` строит URL из `request.scheme`; значит
reverse proxy не передаёт/не применяется `X-Forwarded-Proto: https` для schema
запроса. Нужен корректный forwarded-proto в Caddy либо принудительный canonical
HTTPS URL при генерации schema. После исправления проверить `servers[0].url`.

### 2. Высокий риск — денежный контракт противоречит реализации

`agents/API-CONTRACT.md` §4.5 требует целые minor units (тиyin) в JSON. Но
`apps/payments/models.py:77` хранит `amount_uzs` как `DecimalField(...,
decimal_places=2)`, а `apps/payments/presenters.py:65,86` отдаёт строку с двумя
знаками после запятой. Тестовая фабрика использует `Decimal("100000.00")`, а
`apps/payments/tests/builders.py:76–80` отдельно умножает UZS на 100 только для
Payme.

Клиент, следующий контракту, может показать или списать сумму в 100 раз больше
либо меньше. Нужно выбрать один стандарт: либо integer tiyin в API, либо decimal
UZS, и синхронно обновить модель/презентеры/документацию/тесты. В текущей
консоли значения обрабатываются как decimal UZS, поскольку это соответствует
фактическому коду.

### 3. Средний риск — README описывает несуществующий JWT refresh-flow

`README.md` backend’а утверждает, что login возвращает `{access, refresh}` и
токены JWT. Однако `config/settings/base.py:279–284` подключает
`core.session_auth.SessionAuthentication`, а `agents/API-CONTRACT.md` §3 и live
OpenAPI описывают один opaque session key без refresh endpoint.

Новый frontend, ориентирующийся на README, будет хранить неверный формат сессии
и пытаться обновлять отсутствующий refresh token. Нужно обновить README до
реального session-key flow.

### 4. Средний риск — OpenAPI пока не годится для typed code generation

В переданной `schema.json` у операций тела запросов имеют `{"type":"object"}`,
а успешные ответы ссылаются на общий `Success`, где поле `data` не типизировано.
Это не даёт сгенерировать проверяемые TypeScript/Dart-модели, хотя в документации
заявлена генерация клиентов. Нужны request/response schemas для каждой операции
или отдельно опубликованный typed contract.

## Что проверено и работает

- Live API отвечает в едином envelope и возвращает `X-Request-ID`.
- Preflight с `Origin: http://localhost:5173` не возвращает
  `Access-Control-Allow-Origin`; прямой browser-запрос к deployment будет
  заблокирован CORS. Для локальной разработки в консоли включён Vite proxy.
- Защищённый `GET /api/v1/students/` корректно отвечает `401
  authentication_failed` без session key.

Серверный репозиторий не изменялся: это только отчёт с воспроизводимыми
наблюдениями для backend-команды.
