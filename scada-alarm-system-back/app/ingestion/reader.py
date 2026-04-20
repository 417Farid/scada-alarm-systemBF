import pandas as pd

def read_file(file_path: str):
    if file_path.endswith('.csv'):
        df = pd.read_csv(file_path)
        df.columns = df.columns.str.strip().str.lower()
        return df
    elif file_path.endswith('.json'):
        return pd.read_json(file_path)
    else:
        raise ValueError("Unsupported file format")