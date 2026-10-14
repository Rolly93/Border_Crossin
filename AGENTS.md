# AGENTS.md — Border_Crossin

## Quick Start

```bash
# Backend (from backend/)
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Frontend (from Frontend/)
npm install
npm run dev

# Docker (from root)
docker-compose up --build
```

## Architecture

- **Monorepo**: `backend/` (FastAPI) + `Frontend/` (React + Vite)
- **Backend**: Layered — routes → services → models (SQLAlchemy)
- **Frontend**: Feature-based — `features/`, `pages/`, `components/`
- **Database**: SQLAlchemy with multi-backend support (SQLite default, MySQL, Postgres, Supabase)
- **Auth**: JWT (HS256), admin required for SFTP config mutations

## Key Commands

| Task | Command | Dir |
|------|---------|-----|
| Run backend dev | `uvicorn main:app --host 0.0.0.0 --port 8000 --reload` | `backend/` |
| Run frontend dev | `npm run dev` | `Frontend/` |
| Type-check frontend | `npm run typecheck` | `Frontend/` |
| Lint frontend | `npm run lint` | `Frontend/` |
| Full test suite (frontend) | `npm run test` | `Frontend/` |
| Build frontend | `npm run build` | `Frontend/` |
| Init DB (dev) | `python -m scripts.init_db` | `backend/` |
| Docker up | `docker-compose up --build` | root |

## Environment

- **Backend `.env`**: Copy from `.env.example`, set `DATABASE_URL` or `DB_BACKEND` + credentials
- **Frontend `.env`**: `VITE_API_URL`, `VITE_USE_MOCK=true` for local mock data
- **Required for SFTP**: `SECRET_KEY` (Fernet key, generate with `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`)
- **Docker**: Uses `.env` at root for MySQL credentials (`MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, etc.)

## Database

- Default: SQLite at `./bordercrossing.db` (no config needed)
- Switch via `DB_BACKEND=mysql|postgres|supabase` + `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- Or set `DATABASE_URL` directly (takes precedence)
- Tables auto-created on startup (`Base.metadata.create_all` in `main.py`)
- Run `python -m scripts.init_db` to seed default client (Expeditors) + admin user

## SFTP & XML Processing

- Per-client SFTP config stored in DB (`SftpService` table), passwords encrypted with Fernet (`SECRET_KEY`)
- XML events: AFS, DPU, EXR, ECC, ILR, CLR, ST1, TSC
- Filename convention: `SCAC_REFERENCIA_EVENTO_YYYYMMDDHHMMSS.xml`
- Incoming: SFTP → parse XML → create `ShipmentEventModel` → queue `SftpSend` for outbound
- Outbound: `SftpSendService` processes pending sends, retries on failure

## Frontend Quirks

- `VITE_USE_MOCK=true` enables mock data (`src/mocks/`) — disable for real API
- Oxlint + Stylelint + oxfmt for lint/format (`npm run lint`, `npm run format:write`)
- Vitest for unit tests (`npm run vitest`)
- Storybook available (`npm run storybook`)

## Common Gotchas

1. **Requirements.txt has merge conflicts** — fix before `pip install`
2. **Backend runs from `backend/` dir** — imports are relative (`from database import engine`)
3. **Docker backend command** runs `sleep 5 && python -m scripts.init_db && uvicorn...` — waits for MySQL healthcheck
4. **Frontend Docker** builds with Vite, serves via nginx — API calls proxy to backend container
5. **JWT sub claim** may be RFC (string) not user ID — see `sftp_route.py:_user_id()`
6. **Port mapping**: Frontend 5173→80 (nginx), Backend 8000, MySQL 3307→3306, SFTP 2222, MailHog 8025

## Project Status

- Phase 1 (Backend core) ✓
- Phase 2 (Frontend dashboard) ✓
- Phase 3 (Docker/Containerization) — in progress (docker-compose works)
- Phase 4 (CI/CD) — planned

## References

- `README.md` — XML schema, event codes, file naming
- `erDiagram.mmd` — Database ER diagram
- `backend/.env.example` — All supported env vars
- `docker-compose.yml` — Full local stack