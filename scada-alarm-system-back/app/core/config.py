import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DB_SERVER: str = os.getenv("DB_SERVER")
    DB_PORT: int = int(os.getenv("DB_PORT"))
    DB_NAME: str = os.getenv("DB_NAME")
    DB_USER: str = os.getenv("DB_USER")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD")

settings = Settings()