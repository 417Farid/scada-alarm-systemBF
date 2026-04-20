from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.alarm_clean import AlarmClean

def bulk_insert_alarm_clean(db, records: list, batch_id: int):
    objects = [
        AlarmClean(**record, batch_id=batch_id)
        for record in records
    ]
    db.bulk_save_objects(objects)
    db.commit()

def get_alarms(
        db: Session,
        start_time = None,
        end_time = None,
        tag = None,
        criticality = None,
        skip = 0,
        limit = 50
):
    query = db.query(AlarmClean)

    if start_time:
        query = query.filter(AlarmClean.event_time >= start_time)

    if end_time:
        query = query.filter(AlarmClean.event_time <= end_time)

    if tag:
        query = query.filter(AlarmClean.tag_name == tag.upper())

    if criticality:
        query = query.filter(AlarmClean.criticality == criticality.upper())

    query = query.order_by(
        AlarmClean.event_time.desc(),
        AlarmClean.alarm_id.desc()
        )

    return query.offset(skip).limit(limit).all()

def get_top_tags(db: Session, 
                 limit=5, 
                 start_time=None, 
                 end_time=None
):
    query = db.query(
        AlarmClean.tag_name,
        func.count(AlarmClean.alarm_id).label("count")
    )

    ## Filters for time range
    if start_time:
        query = query.filter(AlarmClean.event_time >= start_time)

    if end_time:    
        query = query.filter(AlarmClean.event_time <= end_time) 

    total_query = db.query(func.count(AlarmClean.alarm_id))

    if start_time:
        total_query = total_query.filter(AlarmClean.event_time >= start_time)

    if end_time:
        total_query = total_query.filter(AlarmClean.event_time <= end_time)

    total_all = int(total_query.scalar() or 0)

    results = (
        query.filter(AlarmClean.tag_name.isnot(None))
        .group_by(AlarmClean.tag_name)
        .order_by(func.count(AlarmClean.alarm_id).desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "tag_name": tag_name,
            "count": int(tag_count or 0),
            "percentage": round((int(tag_count or 0) / total_all) * 100, 2) if total_all > 0 else 0
        }
        for tag_name, tag_count in results
    ]

def count_alarms(db, **filters):
    query = db.query(AlarmClean)

    if filters.get("start_time"):
        query = query.filter(AlarmClean.event_time >= filters["start_time"])
    if filters.get("end_time"):
        query = query.filter(AlarmClean.event_time <= filters["end_time"])
    if filters.get("tag"):
        query = query.filter(AlarmClean.tag_name == filters["tag"].upper())
    if filters.get("criticality"):
        query = query.filter(AlarmClean.criticality == filters["criticality"].upper())

    return query.count()

def get_alarm_stats(db):
    ## Get total count of alarms
    total = db.query(func.count(AlarmClean.alarm_id)).scalar()
    ## Get count of alarms by criticality
    criticality = (
        db.query(
            AlarmClean.criticality,
            func.count(AlarmClean.alarm_id)
        )
        .group_by(AlarmClean.criticality)
        .all()
    )
    ## Get count of anomalies
    anomalies = db.query(func.count(AlarmClean.alarm_id)).filter(
        AlarmClean.is_anomaly == True).scalar()
    
    return {
        "total": total,
        "by_criticality": {c: count for c, count in criticality},
        "anomalies": anomalies
    }
