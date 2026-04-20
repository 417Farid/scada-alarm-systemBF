from datetime import datetime, timezone

from app.ingestion.reader import read_file
from app.ingestion.processor import process_records

from app.repositories.batch_repository import create_batch, update_batch
from app.repositories.alarm_repository import bulk_insert_alarm_clean
from app.repositories.error_repository import bulk_insert_errors
from app.repositories.raw_repository import bulk_insert_raw

def process_file(db, file_path: str):

    batch = create_batch(db, file_path)

    try:
        df = read_file(file_path)
        clean, errors = process_records(df)

        bulk_insert_raw(db, df.to_dict(orient="records"), batch.batch_id)

        if clean:
            bulk_insert_alarm_clean(db, clean, batch.batch_id)

        if errors:
            bulk_insert_errors(db, errors, batch.batch_id)

        status = "COMPLETED"

    except Exception as e:
        status = "FAILED"
        raise e

    finally:
        update_batch(
            db,
            batch,
            total=len(df) if 'df' in locals() else 0,
            processed=len(clean) if 'clean' in locals() else 0,
            errors=len(errors) if 'errors' in locals() else 0,
            status=status,
            finished_at=datetime.now(timezone.utc)
        )

        db.commit()

    return {
        "total_rows": batch.total_rows,
        "processed_rows": batch.processed_rows,
        "error_rows": batch.error_rows,
    }