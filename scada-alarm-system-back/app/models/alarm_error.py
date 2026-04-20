from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from .base import Base

class AlarmError(Base):
    __tablename__ = "alarm_errors"

    error_id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("ingestion_batches.batch_id"))
    raw_payload = Column(String)
    error_message = Column(String(255))
    occurred_at = Column(DateTime, default=datetime.utcnow)