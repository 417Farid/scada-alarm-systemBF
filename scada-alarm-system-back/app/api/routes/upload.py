from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.services.ingestion_sevice import process_file

router = APIRouter()

@router.post("/process-file")
def upload(file_path: str, db: Session = Depends(get_db)):
    return process_file(db, file_path)