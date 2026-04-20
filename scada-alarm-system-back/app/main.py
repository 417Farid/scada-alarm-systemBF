from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy import inspect
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import engine
from app.models.base import Base

from app.models.ingestion_batch import IngestionBatch
from app.models.alarm_raw import AlarmRaw
from app.models.alarm_clean import AlarmClean
from app.models.alarm_error import AlarmError

from app.api.dependencies import get_db
from app.api.routes import upload
from app.api.routes import alarms_routes

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(alarms_routes.router)