"""
Conexión a la base de datos. El motor se elige con variables de entorno:

Prioridad:
1. DATABASE_URL: URL completa (cualquier motor). Si existe, gana siempre.
2. DB_BACKEND: sqlite | mysql | postgres | supabase
3. Sin nada: SQLite local (./bordercrossing.db)
"""

import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import URL, make_url
from sqlalchemy.orm import sessionmaker
from config import Env

load_dotenv()
env = Env()

DEFAULT_SQLITE_PATH = env.DATABASE_URL
SUPPORTED_BACKENDS = ("sqlite", "mysql", "postgres", "supabase")


def _env(name: str, default: str | None = None) -> str | None:
    value = os.getenv(name)
    return value.strip() if value and value.strip() else default


def _sqlite_url() -> URL:
    return URL.create("sqlite", database=_env("SQLITE_PATH", DEFAULT_SQLITE_PATH))


def _server_url(backend: str) -> URL:
    """Construye la URL de un motor cliente usando un diccionario de configuración."""

    host = _env("DB_HOST")
    if not host:
        raise ValueError(f"DB_BACKEND={backend} requiere DB_HOST")

    backend_configs = {
        "mysql": {
            "drivername": _env("DB_DRIVER", "mysql+pymysql"),
            "port": int(_env("DB_PORT") or "3306"),
            "default_db": "",
            "query": {},
        },
        "postgres": {
            "drivername": _env("DB_DRIVER", "postgresql+psycopg2"),
            "port": int(_env("DB_PORT") or "5432"),
            "default_db": "postgres",
            "query": {"sslmode": _env("DB_SSLMODE")} if _env("DB_SSLMODE") else {},
        },
        "supabase": {
            "drivername": _env("DB_DRIVER", "postgresql+psycopg2"),
            "port": int(_env("DB_PORT") or "5432"),
            "default_db": "postgres",
            "query": {"sslmode": "require"},
        },
    }

    cfg = backend_configs.get(backend)
    if not cfg:
        raise ValueError(f"Backend no configurado: {backend}")

    return URL.create(
        drivername=cfg["drivername"],
        username=_env("DB_USER", ""),
        password=os.getenv("DB_PASSWORD", ""),
        host=host,
        port=cfg["port"],
        database=_env("DB_NAME", cfg["default_db"]),
        query=cfg["query"],
    )


def build_database_url() -> URL:
    explicit = _env("DATABASE_URL")
    if explicit:
        return make_url(explicit)

    backend = (_env("DB_BACKEND") or "").lower()
    if not backend:
        backend = "mysql" if _env("DB_HOST") else "sqlite"

    # Normalizar alias
    if backend == "postgresql":
        backend = "postgres"

    # Diccionario de funciones despachadoras para evitar ifs en cascada
    backend_dispatch = {
        "sqlite": _sqlite_url,
        "mysql": lambda: _server_url("mysql"),
        "postgres": lambda: _server_url("postgres"),
        "supabase": lambda: _server_url("supabase"),
    }
    builder = backend_dispatch.get(backend)
    if not builder:
        raise ValueError(
            f"DB_BACKEND desconocido: '{backend}'. Valores válidos: {', '.join(SUPPORTED_BACKENDS)}"
        )

    return builder()


DATABASE_URL = build_database_url()
_is_sqlite = DATABASE_URL.get_backend_name() == "sqlite"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    connect_args={"check_same_thread": False} if _is_sqlite else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
print(f"[db] Conectando a: {DATABASE_URL.render_as_string(hide_password=True)}")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
