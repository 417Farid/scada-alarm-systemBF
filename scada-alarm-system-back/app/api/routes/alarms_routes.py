from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from app.api.dependencies import get_db
from app.services.alarm_service import get_stats as get_alarm_stats, list_alarms, top_tags
from typing import List
from app.schemas.alarm_schema import AlarmListResponse, TopTagResponse

router = APIRouter(prefix="/alarms", tags=["Alarms"])

@router.get("/", response_model=AlarmListResponse)
def get_alarms(
    start_time: datetime | None = None,
    end_time: datetime | None = None,
    tag: str | None = None,
    criticality: str | None = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):  
    return list_alarms(
        db, start_time=start_time, 
        end_time=end_time, 
        tag=tag, 
        criticality=criticality, 
        skip=skip, 
        limit=limit
    )

@router.get("/top-tags", response_model=List[TopTagResponse])
def get_top_tags(
    limit: int = 5,
    start_time: datetime | None = None,
    end_time: datetime | None = None,
    db: Session = Depends(get_db)
):
    return top_tags(db, limit, start_time, end_time)

@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db)
):
    return get_alarm_stats(db)
