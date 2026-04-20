from app.models.alarm_error import AlarmError

def bulk_insert_errors(db, records: list, batch_id: int):
    objects = [
        AlarmError(
            batch_id=batch_id,
            raw_payload=record["raw_payload"],
            error_message=record["error_message"]
        )
        for record in records
    ]
    db.bulk_save_objects(objects)
    db.commit()
