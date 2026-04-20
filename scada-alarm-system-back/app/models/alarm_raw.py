from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from .base import Base

class AlarmRaw(Base):
    __tablename__ = "alarm_raw"

    raw_id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("ingestion_batches.batch_id"))
    raw_payload = Column(String)
    ingested_at = Column(DateTime, default=datetime.utcnow)