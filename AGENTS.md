# AGENTS.md — Border_Crossin

## Layout

- Monorepo: `backend/` FastAPI + `Frontend/` React/TypeScript/Vite + `aws/` Lambda (`aws/assignation_notifier/handler.py`, boto3 SES email sender). No root JS workspace.
- Backend layered `routes/` → `service/` / `utility/` → `repository/` → `model/`; `deps/auth.py`; `schema/`. Run backend from `backend/`; imports are `from database import engine`, `from config.config import Env`. `main.py` `Base.metadata.create_all` + `upgrade_unit_schema`.
- Frontend feature-based `Frontend/src/features/` + `pages/` + `components/`; package `mantine-vite-template`; React 19, TS 6, Vite 8, Mantine. `Frontend/src/mocks/` + `VITE_USE_MOCK=true`; `Frontend/src/types/api.d.ts` generated.
- SQLAlchemy DB. No `.github/workflows`; no repo-local OpenCode config. This `AGENTS.md` + `PROJECT_CONTEXT.md` are repo instructions/context; `README.md` XML schema; `erDiagram.mmd` ER.

## Setup

Backend (from `backend/`):

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate ; POSIX: source .venv/bin/activate
pip install -r requirements.txt
pip install bcrypt   # scripts.init_db imports bcrypt; not listed in requirements.txt
cp .env.example .env
# set JWT_SECRET_KEY + FERNET_KEY; don't commit .env
python -m scripts.init_db
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

`config.config` loads `backend/.env`; `database.py` also `load_dotenv()`. `.env*` gitignored. Python 3.11+. No known `requirements.txt` conflicts.

Frontend (from `Frontend/`):

```bash
npm install
cp .env.example .env
npm run dev
```

`VITE_API_URL`; `VITE_USE_MOCK=true` mock. `npm run prepare` installs husky; `lint-staged`. 

Docker (root): `cp .env.example .env`; set `MYSQL_*`, `JWT_SECRET_KEY`, `FERNET_KEY`; `docker-compose up --build`. Backend `env_file: .env`, `DB_HOST=mysql`, `DB_PORT=3306`, `DB_DRIVER=mysql+pymysql`, `DB_NAME=$MYSQL_DATABASE`, `DB_USER`, `DB_PASSWORD`; MySQL healthcheck; `python -m scripts.init_db && uvicorn main:app ...`. No `sleep 5`.

## Commands

Backend from `backend/`:

- `uvicorn main:app --host 0.0.0.0 --port 8000 --reload`
- `python -m scripts.init_db`: create tables + seed `Expeditors` + reference rules via `scripts.seed_reference_rules`. Existing tables skip `create_all`. **Seeds no admin**: with no users, `/onetime` → `POST /employees/create` (no token) creates the first account, CSR only, always admin, works once (closed once any user exists). 
- `alembic` (`alembic.ini`, `migrations/`); `get_database_url()` for alembic. No backend test suite in repo.

Frontend from `Frontend/`:

- `npm run dev`, `npm run preview`
- `npm run typecheck` (`tsc --noEmit`)
- `npm run lint` = `oxlint .` + `stylelint '**/*.css' --cache`; `npm run oxlint`, `npm run stylelint`
- `npm run format:test`, `npm run format:write`
- `npm run vitest`, `npm run vitest:watch`; **no test files currently**; single test `npx vitest run src/path/file.test.ts`; Vitest `jsdom`, `vitest.setup.mjs`, MSW
- `npm run build` = `tsc && vite build`; `npx vite build` skips typecheck
- `npm test` = `typecheck && format:test && lint && vitest && build`; no CI to enforce; currently not guaranteed green
- `npm run generate:api` (backend `:8000/openapi.json` → `src/types/api.d.ts`)
- `npm run storybook`, `npm run storybook:build`

## Environment / security

- `backend/.env`: `JWT_SECRET_KEY`, `FERNET_KEY`, `ALGORITHM=HS256`, `ACCESS_TOKEN_EXPIRE_MINUTES=30`, `DATABASE_URL`, `DB_*`, SFTP/mail, `SQLITE_PATH`. `backend/.env.example`. 
- JWT secret = `JWT_SECRET_KEY` or legacy `SECRET_KEY`. Fernet = `FERNET_KEY` or legacy `SECRET_KEY`. `SECRET_KEY` deprecated. Surrounding quotes stripped. Required for JWT + SFTP password encryption. Don’t print secrets. 
- `FERNET_KEY` generate `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`. `JWT_SECRET_KEY` generate `python -c "import secrets; print(secrets.token_urlsafe(32))"`. 
- `DATABASE_URL` always wins. Else `DB_BACKEND=sqlite|mysql|postgres|supabase`; `postgresql`→`postgres`. `DB_HOST` required for server DBs; `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`, `DB_DRIVER`, `DB_SSLMODE`. Supabase `sslmode=require`. `DB_BACKEND` unset + `DB_HOST`→mysql else sqlite. SQLite `SQLITE_PATH`; example `./bordercrossing.db`; relative to backend cwd; empty `DATABASE_URL` treated unset. `*.env.example` allowed. 
- JWT HS256; `sub` stringified; `get_user_id()` in `backend/deps/auth.py` rejects non-numeric `sub` with 403. `require_admin`. Admin for SFTP config mutations. 

## SFTP & XML

- **SFTP is outbound-only.** `backend/service/sftp_service.py` `SFTPService` opens paramiko SFTP; `upload_file(local_path)` → `sftp.put` to `remote_folder/<basename>`, returns remote path. No incoming SFTP server; no reading/listing/downloading XML; no incoming-XML parsing. Raises `exeption/sftp_exception.SftpConnectionError` (user-readable). 
- **Host key = trust on first test.** `sftp_service.host_key` (`"<type> <base64>"`) saved by `POST /sftp/test/{id}` (admin, "Probar conexión"); later connects `RejectPolicy` against it (mismatch → clear error). No stored key → sends fail "Probar conexión". No `~/.ssh/known_hosts` use. 
- Per-client `SftpService`. **host, username, password all Fernet-encrypted**; `repository/sftp_repository.py` is the ONLY place that encrypts/decrypts (`to_connection(row)` → decrypted `SftpConfigurationRequest` with `.password`). Decrypt failure → `SftpConfigUnreadable` (shipment update still succeeds, sends failed, alert). `utility/schema_upgrade.upgrade_sftp_schema` adds `host_key`/`sftp_send.last_attempt_at`, widens columns, encrypts legacy plain rows (idempotent). Lose `FERNET_KEY` = configs unreadable. `root_folder`, `remote_folder`. 
- **Soft delete reusable:** `DELETE /sftp/delete/{id}` only `is_active=False`; `GET /sftp/connection` returns active else latest inactive (`is_active:false`); `PUT /sftp/update/{id}` / `POST /sftp/create` reactivate it. 
- `XMLService.create_event_file` writes **local** XML; not reads. `XMLServiceFactory` only `ExpeditorsXMLService`; root `<AvisoEventos>`. `SCAC` from `SystemConfigRepository.get_scac()`, required. 
- `ShipmentEventModel` created in-app. On shipment update, `ShipmentDispatchService.dispatch_events(new_events, config_id)` only creates `SftpSend(pending)`; `update_shipment` returns `(shipment, pending_send_ids)` and `routes/shipment.py` schedules `service/sftp_dispatcher.process_sends` as a **BackgroundTask** (request returns immediately). `sftp_sender.send_with_retries`: **4 attempts** in rounds (one connection per round), waits `RETRY_DELAYS=(10,30,60)`s; intermediate failure stays `pending` (`retries`+1, `sftp_log`, `last_attempt_at`), 4th → `failed` + one alert. Result broadcast on `/events/stream` (`{shipment_id,status:SUCCESS|FAILED,message}`). Startup (`main.py` lifespan) resumes leftover `pending`. `POST /sftp/resend`: `failed` or `pending` stuck >10 min, one immediate attempt (`send_once`) with the client's **current active** config. `retries` = failed attempts. No SCAC → failed. 
- `/sftp/sends`, `/sftp/resend`, `/sftp/connection`, `/sftp/create`, `/sftp/update/{config_id}`, `/sftp/delete/{config_id}`. 
- Events `AFS,DPU,EXR,ECC,ILR,CLR,ST1,TSC`. Internal `EventCategory` mapping `pick_up→AFS`, `departure→DPU`, `mex_inspeccion→EXR`, `clear_mex→ECC`, `usa_inspeccion→ILR`, `clear_usa→CLR`, `safety_yard→ST1`, `deliver→TSC`; `delay` internal. `<AvisoEventos ReferenciaExpd TipoOperacion CodigoTransportista ReferenciaTransportista CodigoEvento FechaHoraEvento Comentarios>`. 
- `SCAC_REFERENCIA_EVENTO_YYYYMMDDHHMMSS.xml`. `ExpeditorsXMLService`: `customer_tracking` required len 10 starts `82B`/`92B` suffix digits; `FechaHoraEvento` `YYYY-MM-DDTHH:MM:SS`; event time required; `CodigoEvento`; `CodigoTransportista=SCAC`; `TipoOperacion`. 
- `backend/api/upload.py` not included in `main.py`; stale/incompatible (`SFTPService()` no config; `upload_file(local, remote)` vs `upload_file(local_path)`); don’t use. `README`/old `AGENTS.md` “incoming SFTP” stale. Optional Docker `sftp` test server `2222:22` + `sftp_data`, not app incoming-XML. 

## Email notifications

- **Assignment:** `ShipmentService.create_shipment` calls `ShipmentDispatchService.notify_assigment(...)` (misspelled) when client has `ClientServiceType.EMAIL` + active recipients. `NotificationType.NOTIFACTION` = `"notification"`; `PayloadAssginationNotificationEvent`; `dispatch_service` → `EmailNotificationDispatcher.send_assignation`. 
- **Updated status:** `ShipmentService.update_shipment` calls `notify_status(...)` when `service.emailService` — **but `service` is fetched only with `ClientServiceType.SFTP`, so `emailService` is always `None` and status emails never send** (needs a second `get_client_service(..., ClientServiceType.EMAIL)` lookup); `NotificationType.STATUS`; `PayloadStatusTrailer`/`PayloadStatusConsolidate`; `send_status`. `notify_status` selects `template_export.html` for `northbound`, `template_Import.html` otherwise. 
- `EmailNotificationDispatcher` uses Jinja + `AssignationLambdaClient.send_notice(to, subject, html)`, not `fastapi-mail`; `send_notice` POSTs `{to,subject,html}` to `ENDPOINT_AWS`, header `x-api-key=$APIKEY_AWS`, `Content-Type=application/json`, `httpx`, timeout 10. `get_lambda_client` returns `None` without `ENDPOINT_AWS`+`APIKEY_AWS`; `send_assignation`/`send_status` no-op if no valid emails or lambda `None`. `send_notice` errors logged, not re-raised inside try. 
- **Backend ↔ Lambda contract aligned** (see Server-error alerts): `{to, subject, html}` + `x-api-key`; SES `SES_SENDER_EMAIL`. Deployed Lambda must be updated to match. 
- `ClientEmailRecipient.is_active`; active `EmailConfigurationRequest.email` list. `backend/service/__init__.py` exports `EmailNotificationDispatcher`; `ShipmentDispatchService` lazy-imports it to avoid the `deps.auth` ↔ `service.email` cycle. 
- **Services do not query directly.** `utility/*_service.py` and `service/*` orchestrate; `repository/*` owns SQLAlchemy queries/commits/refreshes. `ClientRuleRepository` owns reference-rule queries; `DriverRepository` owns driver lookups; `UnitRepository` owns unit/assignment writes; `Sftp_Send_Repository` owns send status commits; `ShipmentRepository.refresh` refreshes shipments. 
- **Source-level works ≠ runtime-verified.** `ClienteService.get_client_service` uses `ClientServiceType.SFTP` / `ClientServiceType.EMAIL` and `ClienteRepository.get_active_emails`. Email template path is `backend/service/templates`, but actual templates are `backend/templates` + `.html.jinja`, while code asks `.html`; `_preparate_template` runs before `try`. `_validate_emails` builds `cleaned` but validates original `emails`. `send_assignation` subject has typo `f{payload.tracking_number}` (literal "f"). `update_shipment` email bug + Lambda mismatch above. `NotificationManager` `/events/stream` SSE is separate from email. 

## Server-error alerts

- `service/alerting.py` `report(kind, title, detail, location, ctx)` → `app_error` row (`repository/app_error_repository.py`); same fingerprint within 15 min only bumps `count` (anti-flood); otherwise notifies in a daemon thread: email via `AssignationLambdaClient.send_notice` to `ALERT_EMAILS`, WhatsApp via `integrations/whatsapp_client.MetaWhatsAppClient` (approved template, 3 params) to `ALERT_WHATSAPP_TO`. Missing env = no-op. Never raises; channel failures only logged. 
- **Only server errors:** unhandled exceptions (caught in `main.py` `log_requests` middleware, inside CORS → `500 {"detail": "... Código: <id>"}`), `HTTPException` ≥500, SFTP final failure, client-email failure, SFTP decrypt failure. **Never 4xx.** Admin list: `GET /system/errors`. Sanitizes SQL parameters; no passwords/tokens/bodies. 
- Lambda `aws/assignation_notifier/handler.py` contract now matches backend: header `x-api-key` (or `x-api-token`) = `LAMBDA_API_TOKEN`, body `{to:[...], subject, html}`, SES Html+Text. Redeploy manually. 

## Shipment domain

- `ShipmentAssign` + `ShipmentEventModel`. `tracking_number`, `customer_tracking`, `cliente`, `origen`, `destination`, `truck`, `assignation`, `type_operation=northbound|southbound`, `service_type=trailer_53ft|consolidated`. `schema/shipment_shcema.py` (misspelled). 
- `POST /shipment/create`, `GET /shipment/`, `PUT /shipment/{id}/update`, `PATCH /shipment/{id}/delete`. Current JWT required. `POST` duplicate `tracking_number` 409; client reference validation; `customer_tracking` + `tracking_number`. 
- Active `UnitTruck` `state="ACTIVA"` + open `UnitAssignment` operator; `driver`; `unit_number`. `trailer_53ft` creates `Trailer`; `consolidated` + `consolidate_guide`. `ClientReferenceRule`. 

## Gotchas

1. Backend from `backend/`; `.env` `backend/.env`; venv; `pip install -r requirements.txt`; `init_db` needs `bcrypt`; `main.py` auto-creates tables; `init_db` seeds. 
2. `DATABASE_URL` > `DB_BACKEND`; `SQLITE_PATH`; `DB_NAME`; `DB_DRIVER`; empty env unset; `DATABASE_URL=` empty. `get_database_url` alembic `hide_password=False`; startup prints `hide_password=True`. 
3. `npm test` chains; `npm run build` fails if `tsc` fails; `npx vite build` can build despite TS; no Vitest tests → Vitest exits 1; no stylelint/oxfmt config currently; `stylelint-config-standard-scss` installed but no config. `npm run stylelint` quoted `**/*.css` can fail on Windows/npm-cmd; `npx stylelint **/*.css` checks. 
4. `oxlint` `Frontend/oxlint.config.ts`: `no-console`, `curly`, `eqeqeq`, `no-unused-vars`, `no-alert`, `prefer-template`; `no-console` off `*.story.tsx`. `oxfmt` `*.{ts,tsx,css}`; `format:write` mutates. 
5. `npm run generate:api` needs backend; `VITE_USE_MOCK`; `VITE_API_URL`. 
6. Docker `name=border_crossin`; `docker-compose`; root `.env`; MySQL `3307:3306`, backend `8000`, frontend `5173:80`, SFTP `2222:22`, MailHog `1025`+`8025`; MySQL init `./backend/scripts`; frontend nginx proxy. `CORS_ORIGINS`, `LOG_LEVEL`, `JSON_LOGS`. 
7. `npm install` package lock; `packageManager=npm@10.8.2`. `husky`. `.env`, `.venv`, `node_modules`, `dist`, `*.db`, logs, `sftp_data` not source. 

## References

`PROJECT_CONTEXT.md`, `README.md`, `backend/.env.example`, `Frontend/.env.example`, `docker-compose.yml`, `erDiagram.mmd`, `Frontend/oxlint.config.ts`, `Frontend/vitest.setup.mjs`, `Frontend/nginx.conf`, `backend/alembic.ini`, `backend/main.py`, `backend/model/db_model.py`.
