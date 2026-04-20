from app.models.alarm_raw import AlarmRaw  

def bulk_insert_raw(db, records: list, batch_id: int):
    objects = [
        AlarmRaw(
            batch_id=batch_id,
            raw_payload=str(record)
        )
        for record in records
    ]
    db.bulk_save_objects(objects)
    db.commit()