from app.repositories.alarm_repository import count_alarms, get_alarms, get_top_tags, get_alarm_stats

def list_alarms(db, **filters):
    data = get_alarms(db, **filters)
    total = count_alarms(db, **filters)
    return {
        "total": total,
        "data": data
    }

def top_tags(db, limit=5, start_time=None, end_time=None):
    return get_top_tags(db, limit=limit, start_time=start_time, end_time=end_time)

def get_stats(db):
    return get_alarm_stats(db)
