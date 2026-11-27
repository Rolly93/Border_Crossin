# PROJECT_CONTEXT.md — Border_Crossin

## One-line summary

**Border_Crossin / Xborder** is a cross-border **US ↔ Mexico logistics control system**: a FastAPI + React dashboard/API for creating and tracking shipments, maintaining a normalized event timeline, assigning operating capacity, notifying stakeholders, and **pushing generated shipment-event XML to clients’ systems over SFTP**.

## What the project is

A shipment-tracking and operations app for a company moving freight **northbound/southbound between Mexico (`MEX`) and the United States (`USA`)**. Internal users record shipment facts; the system validates and persists them; operators monitor progress; clients receive notifications and machine-readable event output. 

It is **not** merely a file store, not a public tracking page, and **not an incoming-SFTP/XML reader**. Its SFTP integration sends generated files **to** a client server. 

## Core idea

> **Internal ops create/update validated shipments → system stores event history → dashboard shows status → email notifications + outbound XML via SFTP.**

A “shipment” / `ShipmentAssign` is the central object. The app tracks references, client, origin/destination, carrier SCAC, operation direction, service type, truck/unit, driver, trailer, consolidated guides, assigned day, user, and an event list. Events form the operational/customs timeline. When new events occur on a shipment update, downstream output can be generated.

## Who it works for

- **Operations company:** admins, CSRs (`csr`), operators (`operador`), dispatchers, employees, authenticated users. JWT login; `User.is_admin`; admin-only SFTP configuration. `init_db` seeds admin `USER_EMAIL`/`USER_PASSWORD` (default `admin@test.com`/`1234`) + `Expeditors`. 
- **Logistics clients/customers:** `cliente` companies whose shipments are tracked. Per-client reference rules, email recipients, optional SFTP service. `Expeditors` built-in/default; current XML generator is `ExpeditorsXMLService`. 
- **Operating capacity:** `UnitTruck`, `UnitAssignment`, `DriverDetails`; active `ACTIVA` unit + open operator assignment required for shipment creation. 
- **Downstream client servers/integrators:** SFTP target receiving `<AvisoEventos>` XML in `remote_folder`. They don’t push incoming XML to this app. 
- **Customs/cross-border process:** status model references Mexican customs inspection/clearance + US customs inspection/clearance. 

## End-to-end flow

1. **Frontend** logs in, creates/updates/lists shipments, manages clients/employees/units/SFTP, views events/notifications. React + Mantine + react-query; mock mode optional. 
2. **Backend** FastAPI routes `/shipment`, `/sftp`, `/clients`, `/employee`, `/unit`, `/user`, `/system`, `/notifications`, health. JWT. 
3. **Create shipment** `POST /shipment/create`: validate client + `customer_tracking` reference rules; reject duplicate `tracking_number`; require active unit + assigned operator; `northbound|southbound`; `trailer_53ft|consolidated`; optional `consolidate_guide`; optional trailer; create assignment; optional assignment email. 
4. **Update shipment** `PUT /shipment/{id}/update`: revalidate; update + new `ShipmentEventModel`s; dispatch SFTP for `new_events` if client has `SftpService`; optional status email. 
5. **Events** internal `EventCategory`: `pick_up`, `departure`, `delay`, `mex_inspeccion`, `clear_mex`, `usa_inspeccion`, `clear_usa`, `safety_yard`, `deliver`. 
6. **XML generation** `XMLService` writes local `<AvisoEventos>`. `ExpeditorsXMLService` maps events to `AFS,DPU,EXR,ECC,ILR,CLR,ST1,TSC`; `delay` isn’t an XML output event. Filename `SCAC_REFERENCIA_EVENTO_YYYYMMDDHHMMSS.xml`. `SCAC` required. 
7. **SFTP output** `SftpSend(pending)` → `send_batch` → regenerate XML if missing → `SFTPService.upload_file` `sftp.put`. `sent/failed`; `retries`; `sftp_log`; `MAX_RETRIES=3` = 4 attempts. `POST /sftp/resend` only failed. `SftpSendService.list_sends`. 
8. **Notifications** assignment + updated-status email; see **Email notifications** below. Separate `notification_manager` SSE `/events/stream`. 
9. **Persistence** SQLAlchemy. SQLite default; MySQL/Postgres/Supabase. `DATABASE_URL` wins; `SQLITE_PATH`; `DB_BACKEND`; `DB_*`. `main.py` `Base.metadata.create_all`; `scripts.init_db` seeds. 

## Email notifications (assignment + updated status)

**Yes, source shows this implemented.** Two paths, both in `backend/service/shipment_dispatch_service.py`, ending in `backend/service/email.py`. 

- **Shipment assigned:** `ShipmentService.create_shipment` calls `ShipmentDispatchService.notify_assigment(...)` (misspelled) when `ClienteService.get_client_service(..., ClientServiceType.EMAIL)` returns `emailService`. `NotificationType.NOTIFACTION` = `"notification"`. `PayloadAssginationNotificationEvent(target_email, customer_tracking, tracking_number, type_operation, tag, cfdi, gafet, notification_type)`. `dispatch_service` → `EmailNotificationDispatcher.send_assignation`. 
- **Shipment status updated:** `ShipmentService.update_shipment` calls `ShipmentDispatchService.notify_status(...)` when `service.emailService`. `NotificationType.STATUS`. `PayloadStatusTrailer` or `PayloadStatusConsolidate`. `dispatch_service` → `EmailNotificationDispatcher.send_status`. 
- **Email send primitive:** `EmailNotificationDispatcher` renders Jinja (`template_assignation.html`, `template_export.html`, `template_Import.html`, autoescape) and calls `AssignationLambdaClient.send_notice(to, subject, html)`. `send_notice` POSTs `{to,subject,html}` to `ENDPOINT_AWS`, `x-api-key=$APIKEY_AWS`, `Content-Type=application/json`, `httpx`, `timeout=10`, `raise_for_status`. Not `fastapi-mail` directly. 
- **Recipients:** `ClientEmailRecipient.is_active`; `EmailConfigurationRequest.email:list[EmailStr]`; `EmailRepository.sync_client_emails`; `ClientServiceType.EMAIL=emailService`. 
- **Gating:** `_validate_emails`; `send_assignation`/`send_status` return if no validated emails or `_lambda_client is None`. `get_lambda_client` needs `ENDPOINT_AWS` + `APIKEY_AWS`; else no-op. `send_notice` exceptions are logged, not re-raised inside `try`. 
- **Templates:** `notify_status` `_type_status`: `northbound→template_export.html`, else `template_Import.html`; assignment `template_assignation.html`. 
- **Current worktree state:** synced to commit `10ceb24`; `backend/service/__init__.py` exports `EmailNotificationDispatcher`; `ShipmentDispatchService.__init__` lazy-imports it; `aws_client` required; SFTP send formatting applied. 
- **Source-level vs runtime:** implemented, but not proven end-to-end. `ClienteService.get_client_service` now uses valid `ClientServiceType.SFTP`/`.EMAIL` and `ClienteRepository.get_active_emails`. Remaining blockers: `EmailNotificationDispatcher` template path `backend/service/templates`, actual `backend/templates`, code `.html`, files `.html.jinja`; `_preparate_template` before `try`; `_validate_emails` validates `emails`, not `cleaned`; `update_shipment` `service` handling. `NotificationManager` SSE ≠ email. 

## SFTP / XML correction

**SFTP is outbound-only.** `SFTPService` uses paramiko `open_sftp`, `sftp.put(local_path, remote_folder/<basename>)`. No incoming SFTP server; no list/download/read; no incoming-XML parsing. **XML generation is separate from SFTP.** `XMLService` creates local XML; `SFTPService` uploads it. `SftpSend` is a queued output record, not an incoming event. `api/upload.py` isn’t routed and is stale/incompatible. `README`/old `AGENTS.md` “incoming SFTP” wording is not supported by source. 

## Event/XML semantic model

- Root `<AvisoEventos>`. 
- `ReferenciaExpd` = customer reference. 
- `TipoOperacion` = `northbound`/`southbound`. 
- `CodigoTransportista` = `SCAC`. 
- `ReferenciaTransportista` = `tracking_number`. 
- `CodigoEvento` = `AFS/DPU/EXR/ECC/ILR/CLR/ST1/TSC`. 
- `FechaHoraEvento` = `YYYY-MM-DDTHH:MM:SS`. 
- `Comentarios` = notes. 
- Event mapping `pick_up→AFS`, `departure→DPU`, `mex_inspeccion→EXR`, `clear_mex→ECC`, `usa_inspeccion→ILR`, `clear_usa→CLR`, `safety_yard→ST1`, `deliver→TSC`. 
- `AFS` arrival origin yard, `DPU` departure, `EXR` MX inspection, `ECC` MX clearance, `ILR` US inspection, `CLR` US clearance, `ST1` yard diversion/safekeeping, `TSC` final delivery. 
- `Expeditors` customer reference required len 10 starts `82B`/`92B`, suffix digits. 

## Architecture

- **Backend `backend/`:** FastAPI; layered `routes` → `service`/`utility` → `repository` → `model`; services orchestrate, repositories own ORM queries/commits/refreshes; Pydantic `schema`; `deps/auth`; `api`; `integrations`; `migrations`. Run from `backend/`. `main.py`. `schema/shipment_shcema.py` misspelling. `backend/.env`. `JWT_SECRET_KEY`, `FERNET_KEY`, legacy `SECRET_KEY`, `ALGORITHM=HS256`. Fernet SFTP passwords. `DATABASE_URL`. `bcrypt` `init_db`. 
- **Frontend `Frontend/`:** React 19 + TS 6 + Vite 8 + Mantine; feature modules `shipments`, `sftp`, `clients`, `employee`, `unit`, `login`, `notfications`, `system`, `update`; `pages`; `components`; `mocks`; `types/api.d.ts`; i18n; generated API. 
- **Infra:** Docker Compose `border_crossin`, MySQL, backend, frontend nginx, optional SFTP test, MailHog; SQLite default outside Docker; `.env`; `docker-compose`. No CI in repo. 
- **Instruction/context files:** `AGENTS.md` operational rules; this `PROJECT_CONTEXT.md` stable project summary. 

## Source of truth to verify

Prefer executable/config over prose. Key files:

- `backend/main.py`, `backend/routes/shipment.py`, `backend/routes/sftp_route.py`, `backend/routes/*`, `backend/schema/shipment_shcema.py`, `backend/schema/xml_file_schema.py`, `backend/schema/cargo_schema.py`
- `backend/utility/shipment_service.py`, `backend/utility/sftp_send_service.py`, `backend/utility/sftp_config_service.py`, `backend/repository/*`
- `backend/service/shipment_dispatch_service.py`, `backend/service/sftp_sender.py`, `backend/service/sftp_service.py`, `backend/service/xml_service.py`, `backend/service/xml_factory.py`, `backend/service/email.py`, `backend/service/jwt_service.py`, `backend/service/notification_manager.py`
- `backend/model/db_model.py`, `backend/database.py`, `backend/config/config.py`, `backend/utility/encryption.py`, `backend/deps/auth.py`, `backend/scripts/init_db.py`, `backend/scripts/seed_reference_rules.py`
- `Frontend/package.json`, `Frontend/src/*`, `Frontend/src/types/api.d.ts`, `Frontend/vite.config.mjs`, `Frontend/oxlint.config.ts`, `Frontend/vitest.setup.mjs`
- `docker-compose.yml`, `backend/Dockerfile`, `Frontend/Dockerfile`, `Frontend/nginx.conf`, `backend/.env.example`, `Frontend/.env.example`, `.env.example`, `README.md`, `erDiagram.mmd`. 

## Current repo state / stale notes

- Working copy we operate in: git worktree `.../border_crossin-setup`, branch `setup`, synced to `10ceb24`, plus `M AGENTS.md` + `?? PROJECT_CONTEXT.md`; original repo untouched. `.env`, `node_modules`, `.venv`, `dist` not source. 
- Repository ownership: services orchestrate; repositories own SQLAlchemy queries, commits, refreshes. `ClientRuleRepository`, `DriverRepository`, `UnitRepository`, `Sftp_Send_Repository`, `SftpRepository`, `ShipmentRepository`, `ClienteRepository` cover the former service-layer queries. 
- Existing `AGENTS.md` had stale items: `requirements.txt` merge conflicts; `SECRET_KEY` only for SFTP; `sleep 5`; `sftp_route.py:_user_id()`; incoming SFTP; `SftpSendService` naming; README React 18/TS5/Mantine vs actual React19/TS6; Docker status drift. 
- `README` says incoming SFTP; source is outbound. `api/upload.py` stale. `package.json` `mantine-vite-template`. No repo-local OpenCode config, CI, Vitest tests, stylelint config, oxfmt config. `npm test` not guaranteed green. 
- Not every source file was line-by-line audited; no live runtime/SFTP test in this context. 

## Verification checklist for you

1. Does one-line summary match your intent? 
2. SFTP direction correct: **outbound XML to client server**, not reading XML? 
3. `Expeditors` + `SCAC` + `82B/92B` + `AFS/DPU/EXR/ECC/ILR/CLR/ST1/TSC` correct? 
4. `northbound/southbound`, `MEX/USA`, `trailer_53ft/consolidated`, `csr/operador/admin`, active unit + assigned operator correct? 
5. Event mapping + `<AvisoEventos>` fields correct? 
6. Which parts are docs-only vs actual behavior? 
7. Any event currently generated on update but not meant for XML (e.g. `delay`)? 
8. Any stale `api/upload.py`/incoming-SFTP references to remove? 
9. Runtime test plan: seed DB, create shipment, add events, inspect `SftpSend`, verify SFTP upload + retry/resend + SCAC. 
