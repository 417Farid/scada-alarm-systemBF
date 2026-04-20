from app.ingestion.validator import is_valid_record
from app.ingestion.normalizer import normalize_record

def process_records(df):
    clean = []
    errors = []

    for _, row in df.iterrows():
        record = row.to_dict()
        is_valid, error = is_valid_record(record)

        if is_valid:
            normalized = normalize_record(record)
            clean.append(normalized)
        else:
            errors.append({"raw_payload": str(record), "error_message": error})

    return clean, errors