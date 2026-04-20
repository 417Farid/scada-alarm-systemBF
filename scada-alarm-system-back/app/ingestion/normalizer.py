from datetime import datetime

def try_float(value):
    try:
        return float(value) if value is not None else None
    except (ValueError, TypeError):
        return None

def normalize_record(record: dict):
    timestamp = record.get("timestamp")

    parsed_time = None
    is_anomaly = False

    try:
        parsed_time = datetime.fromisoformat(str(timestamp))
        is_anomaly = parsed_time.year < 2000
    except (ValueError, TypeError):
        ## If timestamp is invalid, we can set it to None and flag as anomaly
        parsed_time = None

    tag = record.get("tag")
    criticality = record.get("criticality")
    state = record.get("state")
    ack = record.get("ack")

    return {
        "event_time": parsed_time, 
        "tag_name": str(tag).strip().upper() if tag else None,
        "criticality": str(criticality).strip().upper() if criticality else None,
        "message": str(record.get("message", "")).strip(),
        "value_numeric": try_float(record.get("value")),
        "event_state": str(state).strip().upper() if state else "UNKNOWN",
        "ack_state": str(ack).strip().upper() if ack else "UNACK",
        "source": str(record.get("source", "SCADA")).strip().upper(),
        "is_anomaly": is_anomaly
    }