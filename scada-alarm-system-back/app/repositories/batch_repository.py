from datetime import datetime

from app.models.ingestion_batch import IngestionBatch

def create_batch(db, file_name: str):
    batch = IngestionBatch(
        file_name=file_name,
        status='PROCESSING'
    )
    db.add(batch)
    db.commit()
    return batch

def update_batch(db, batch, total, processed, errors, status=None, finished_at=None):
    batch.total_rows = total
    batch.processed_rows = processed
    batch.error_rows = errors
    if status:
        batch.status = status
    if finished_at:
        batch.finished_at = finished_at
    db.commit()