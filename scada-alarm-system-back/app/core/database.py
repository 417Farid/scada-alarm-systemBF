from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from urllib.parse import quote_plus

from app.core.config import settings

username = quote_plus(settings.DB_USER)
password = quote_plus(settings.DB_PASSWORD)
driver = "ODBC Driver 18 for SQL Server"


def build_connection_string(database_name: str) -> str:
    return (
        f"mssql+pyodbc://{username}:{password}"
        f"@{settings.DB_SERVER}:{settings.DB_PORT}"
        f"/{database_name}"
        f"?driver={quote_plus(driver)}&TrustServerCertificate=yes&Encrypt=yes"
    )


engine = create_engine(
    build_connection_string(settings.DB_NAME),
    echo=True,
    pool_pre_ping=True,
)

master_engine = create_engine(
    build_connection_string("master"),
    echo=True,
    pool_pre_ping=True,
    isolation_level="AUTOCOMMIT",
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
