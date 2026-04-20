from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from urllib.parse import quote_plus
from app.core.config import settings

# 🔥 Encodear usuario y password
username = quote_plus(settings.DB_USER)
password = quote_plus(settings.DB_PASSWORD)

# 🔥 IMPORTANTE: usar formato correcto para SQL Server
connection_string = (
    f"mssql+pyodbc://{username}:{password}"
    f"@{settings.DB_SERVER}:{settings.DB_PORT}"
    f"/{settings.DB_NAME}"
    f"?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes"
)

engine = create_engine(
    connection_string,
    echo=True,
    pool_pre_ping=True  # 🔥 evita problemas de conexión
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)