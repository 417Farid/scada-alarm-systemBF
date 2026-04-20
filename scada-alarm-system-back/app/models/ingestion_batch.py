from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from .base import Base

class IngestionBatch(Base):
    __tablename__ = "ingestion_batches"

    batch_id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String(225))
    total_rows = Column(Integer)
    processed_rows = Column(Integer)
    error_rows = Column(Integer)
    status = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)