from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ChatMessageResponse(BaseModel):
    id: int
    patient_id: Optional[int] = None
    role: str
    content: str
    intent: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
