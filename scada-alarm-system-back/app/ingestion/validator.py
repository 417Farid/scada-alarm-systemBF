from datetime import datetime
from numpy import record
import pandas as pd

def is_valid_record(record: dict):
    try:
        ## Validate timestamp field
        if not record.get("timestamp"):
            return False, "Missing 'timestamp' field"

        ## Validate if timestamp is not too old, for anomaly detection, we can flag records with timestamps before the year 2000 as anomalies
        parsed_time = datetime.fromisoformat(str(record.get("timestamp")))
        if parsed_time.year < 2000:
            pass

        ## Validate tag field
        tag = record.get("tag")
        if tag is None or pd.isna(tag) or str(tag).strip() == "":
            return False, "Missing or empty 'tag' field"

        ## Validate criticality field
        valid_criticality = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}
        criticality = record.get("criticality")
        
        if criticality is None or pd.isna(criticality) or str(criticality).strip() == "":
            return False, "Missing or empty 'criticality' field"
        
        criticality = str(criticality).strip().upper()
        if criticality not in valid_criticality:
            return False, "Invalid 'criticality' field"

        # Validate value is numeric
        value = record.get("value")
        if value:
            try:
                float(value)
            except (ValueError, TypeError):
                return False, "Invalid 'value' field"
        
        ## Validate state field
        valid_states = ["ACTIVE", "CLEARED"]
        state = record.get("state")
        if state:
            state = state.strip().upper()

        if state not in valid_states:
            state = "UNKNOWN"

        return True, None

    except Exception:
        return False, "Invalid timeStamp"