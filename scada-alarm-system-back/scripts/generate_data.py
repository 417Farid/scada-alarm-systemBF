import random
import json
import pandas as pd
import sys
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

LOCAL_TIMEZONE = ZoneInfo("America/Bogota")

TAGS = [
    "MOTOR_1",
    "MOTOR_2",
    "MOTOR_3",
    "PUMP_1",
    "PUMP_2",
    "PUMP_3",
    "VALVE_1",
    "VALVE_2",
    "VALVE_3",
    "TEMP_SENSOR",
    "PRESSURE_SENSOR",
    "FLOW_SENSOR",
    "LEVEL_SENSOR",
    "VIBRATION_SENSOR",
    "POWER_METER",
]
CRITICALITY = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] 
STATES = ["ACTIVE", "CLEARED"]
ACKS = ["ACKNOWLEDGED", "UNACKNOWLEDGED"]

# Generate a random timestamp within the year 1900 to 1999
def old_timestamp():
    year = random.randint(1900, 1999)
    month = random.randint(1, 12)
    day = random.randint(1, 28)
    hour = random.randint(0, 23)
    minute = random.randint(0, 59)
    second = random.randint(0, 59)
    dt = datetime(year, month, day, hour, minute, second)
    return dt.isoformat()

# Generate a realistic timestamp distribution with mostly recent events
def random_timestamp():
    now = datetime.now(LOCAL_TIMEZONE)
    recent_window_seconds = 7 * 24 * 60 * 60
    historical_window_seconds = 2190 * 24 * 60 * 60

    # 70% of events from the last 7 days
    if random.random() < 0.7:
        delta_seconds = random.randint(0, recent_window_seconds)
    else:
        # 30% historical events up to 6 years old
        delta_seconds = random.randint(recent_window_seconds + 1, historical_window_seconds)

    delta = timedelta(seconds=delta_seconds)
    dt = now - delta
    return dt.isoformat()


def generate_valid_record():
    tag = random.choice(TAGS)
    return {
        "timestamp": random_timestamp(),
        "tag": tag,
        "criticality": random.choice(CRITICALITY),
        "message": "Alarm triggered for " + tag,
        "value": round(random.uniform(10, 100), 2),
        "state": random.choice(STATES),
        "ack": random.choice(ACKS),
        "source": "SCADA_SYSTEM"
    }

def inject_error(record):
    error_type = random.choice([
        "missing_field",
        "bad_timestamp",
        "bad_value",
        "null_tag",
        "dirty_string",
        "invalid_state",
        "old_timestamp"
    ])

    if error_type == "missing_field":
        record.pop("tag", None)

    elif error_type == "bad_timestamp":
        record["timestamp"] = "invalid_date"

    elif error_type == "bad_value":
        record["value"] = "not_a_number"

    elif error_type == "null_tag":
        record["tag"] = None

    elif error_type == "dirty_string":
        record["tag"] = "   motor_1   "
        record["criticality"] = "high"

    elif error_type == "invalid_state":    
        record["state"] = "UNKNOWN"
        record["ack"] = "MAYBE"
    
    elif error_type == "old_timestamp":
        record["timestamp"] = old_timestamp()

    return record

def generate_dataset(n=10000, error_rate=0.3):
    data = []
    for _ in range(n):
        record = generate_valid_record()
        if random.random() < error_rate:
            record = inject_error(record)
        ## Recalculate the message field in case the tag was modified by an error injection
        record["message"] = f"Alarm triggered for {record.get('tag')}"
        data.append(record)
    return data

if __name__ == "__main__":
    format_type = sys.argv[1] if len(sys.argv) > 1 else "both"
    try:
        n_records = int(sys.argv[2]) if len(sys.argv) > 2 else 10000
        if n_records > 100000:
            print("Please specify a number of records less than or equal to 100,000.")
            exit(1)
        elif n_records <= 0:
            print("Please specify a positive integer major than 0 for the number of records.")
            exit(1)

    except ValueError:
        print("The number of records should be an integer.")
        exit(1)

    dataset = generate_dataset(n_records, 0.3)
    
    if format_type in ["json", "both"]:    
        with open("data.json", "w") as f:
            json.dump(dataset, f, indent=2)
        print("JSON Dataset saved to data.json")

    if format_type in ["csv", "both"]:
        df = pd.DataFrame(dataset)
        df.to_csv("data.csv", index=False)
        print("CSV Dataset saved to data.csv")

    print("Dataset generation complete.")
