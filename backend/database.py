import os
from urllib.parse import quote_plus

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import sessionmaker

load_dotenv()

DEFAULT_SQLITE_URL = "sqlite:///./bordercrossing.db"


def build_database_url() -> str | URL:
    """
    Elige la base de datos según las variables de entorno:

    - Si existe DB_HOST (o cualquier variable DB_* de MySQL), construye la URL de MySQL.
    - Si no, usa DATABASE_URL (por ejemplo sqlite:///../bordercrossing.db).
    - Si tampoco existe, usa SQLite local por defecto.
    """
    db_host = os.getenv("DB_HOST")
    if db_host:
        return URL.create(
            drivername=os.getenv("DB_DRIVER", "mysql+pymysql"),
            username=os.getenv("DB_USER", ""),
            password=os.getenv("DB_PASSWORD", ""),
            host=db_host,
            port=int(os.getenv("DB_PORT", "3306")),
            database=os.getenv("DB_NAME", ""),
        )
    return os.getenv("DATABASE_URL") or DEFAULT_SQLITE_URL


DATABASE_URL = build_database_url()
_is_sqlite = str(DATABASE_URL).startswith("sqlite")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    # FastAPI ejecuta dependencias síncronas en hilos distintos; SQLite necesita esto.
    connect_args={"check_same_thread": False} if _is_sqlite else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
