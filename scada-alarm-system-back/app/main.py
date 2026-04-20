import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.routes import alarms_routes
from app.api.routes import upload
from app.core.config import settings
from app.core.database import engine, master_engine
from app.models.alarm_clean import AlarmClean
from app.models.alarm_error import AlarmError
from app.models.alarm_raw import AlarmRaw
from app.models.base import Base
from app.models.ingestion_batch import IngestionBatch

MAX_DB_INIT_RETRIES = 20
DB_RETRY_DELAY_SECONDS = 3


def initialize_database() -> None:
    last_error = None

    for attempt in range(1, MAX_DB_INIT_RETRIES + 1):
        try:
            with master_engine.connect() as connection:
                connection.execute(
                    text(
                        f"IF DB_ID(N'{settings.DB_NAME}') IS NULL "
                        f"CREATE DATABASE [{settings.DB_NAME}]"
                    )
                )

            Base.metadata.create_all(bind=engine)
            return
        except Exception as exc:
            last_error = exc
            print(
                f"Database initialization attempt "
                f"{attempt}/{MAX_DB_INIT_RETRIES} failed: {exc}"
            )
            time.sleep(DB_RETRY_DELAY_SECONDS)

    raise RuntimeError("Database initialization failed after multiple retries") from last_error


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    initialize_database()


app.include_router(upload.router)
app.include_router(alarms_routes.router)
