from jwt import encode
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os
from dotenv import load_dotenv
from urllib.parse import quote_plus

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "")
ROOT = os.getenv("ROOT", "")
DBPASD = os.getenv("DBPASD", "")
secret_key = os.getenv("SECRET_KEY")
encodepass = quote_plus(DBPASD)
engine = create_engine(
    f"{ROOT}{encodepass}{DATABASE_URL}",
    pool_pre_ping=True,
    # connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
