"""
Conexión a la base de datos. El motor se elige con variables de entorno:

Prioridad:
1. DATABASE_URL: URL completa (cualquier motor). Si existe, gana siempre.
2. DB_BACKEND: sqlite | mysql | postgres | supabase
3. Sin nada: SQLite local (./bordercrossing.db)

Variables por motor (DB_BACKEND):
- sqlite:    SQLITE_PATH (opcional, por defecto ./bordercrossing.db)
- mysql:     DB_HOST, DB_PORT (3306), DB_NAME, DB_USER, DB_PASSWORD
- postgres:  DB_HOST, DB_PORT (5432), DB_NAME, DB_USER, DB_PASSWORD, DB_SSLMODE (opcional)
- supabase:  DB_HOST, DB_PORT (5432 directo o 6543 pooler), DB_NAME (postgres),
             DB_USER, DB_PASSWORD; SSL es obligatorio y siempre se activa.

Compatibilidad: si defines DB_HOST sin DB_BACKEND, se usa MySQL como antes.
"""

import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import URL, make_url
from sqlalchemy.orm import sessionmaker

load_dotenv()

DEFAULT_SQLITE_PATH = "./bordercrossing.db"
SUPPORTED_BACKENDS = ("sqlite", "mysql", "postgres", "supabase")


def _env(name: str, default: str | None = None) -> str | None:
    value = os.getenv(name)
    return value.strip() if value and value.strip() else default


def _sqlite_url() -> URL:
    return URL.create("sqlite", database=_env("SQLITE_PATH", DEFAULT_SQLITE_PATH))


def _server_url(backend: str) -> URL:
    """Construye la URL de un motor cliente. URL.create escapa contraseñas con símbolos."""
    host = _env("DB_HOST")
    if not host:
        raise ValueError(f"DB_BACKEND={backend} requiere DB_HOST")

    if backend == "mysql":
        drivername = _env("DB_DRIVER", "mysql+pymysql")
        port = int(_env("DB_PORT", "3306"))
        query = {}
    else:  # postgres o supabase
        drivername = _env("DB_DRIVER", "postgresql+psycopg2")
        port = int(_env("DB_PORT", "5432"))
        query = {}
        if backend == "supabase":
            query["sslmode"] = "require"
        elif _env("DB_SSLMODE"):
            query["sslmode"] = _env("DB_SSLMODE")

    default_db = "postgres" if backend in ("postgres", "supabase") else ""
    return URL.create(
        drivername=drivername,
        username=_env("DB_USER", ""),
        password=os.getenv("DB_PASSWORD", ""),
        host=host,
        port=port,
        database=_env("DB_NAME", default_db),
        query=query,
    )


def build_database_url() -> URL:
    explicit = _env("DATABASE_URL")
    if explicit:
        return make_url(explicit)

    backend = (_env("DB_BACKEND") or "").lower()
    if not backend:
        backend = "mysql" if _env("DB_HOST") else "sqlite"  # compatibilidad con la versión anterior

    if backend == "sqlite":
        return _sqlite_url()
    if backend in ("mysql", "postgres", "supabase"):
        return _server_url(backend)
    if backend == "postgresql":
        return _server_url("postgres")

    raise ValueError(
        f"DB_BACKEND desconocido: '{backend}'. Valores válidos: {', '.join(SUPPORTED_BACKENDS)}"
    )


DATABASE_URL = build_database_url()
_is_sqlite = DATABASE_URL.get_backend_name() == "sqlite"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    # FastAPI ejecuta dependencias síncronas en hilos distintos; SQLite necesita esto.
    connect_args={"check_same_thread": False} if _is_sqlite else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Visible al arrancar para saber a qué base se conectó (sin contraseña).
print(f"[db] Conectando a: {DATABASE_URL.render_as_string(hide_password=True)}")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
