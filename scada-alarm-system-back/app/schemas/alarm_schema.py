from pydantic import BaseModel
from datetime import datetime  

class AlarmResponse(BaseModel):
    alarm_id: int
    tag_name: str
    criticality: str
    event_time: datetime
    message: str
    value_numeric: float | None
    event_state: str
    ack_state: str
    source: str
    is_anomaly: bool
    processed_at: datetime

    class Config:
        from_attributes = True

class TopTagResponse(BaseModel):
    tag_name: str
    count: int
    percentage: float

class AlarmListResponse(BaseModel):
    total: int
    data: list[AlarmResponse]
