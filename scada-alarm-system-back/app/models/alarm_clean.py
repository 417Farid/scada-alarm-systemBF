from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Float
from datetime import datetime
from .base import Base

class AlarmClean(Base):
    __tablename__ = "alarm_clean"

    alarm_id = Column(Integer, primary_key=True, index=True)
    event_time = Column(DateTime)
    tag_name = Column(String(100))
    criticality = Column(String(20))
    message = Column(String(255))
    value_numeric = Column(Float)
    event_state = Column(String(20))
    ack_state= Column(String(20))
    source = Column(String(100))
    batch_id = Column(Integer, ForeignKey("ingestion_batches.batch_id"))
    processed_at = Column(DateTime, default=datetime.utcnow)
    is_anomaly = Column(Boolean, default=False)