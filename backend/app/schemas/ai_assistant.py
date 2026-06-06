from pydantic import BaseModel
from typing import Optional


class ChatRequest(BaseModel):
    patient_id: Optional[int] = None
    phone: Optional[str] = None
    message: str


class ChatResponse(BaseModel):
    reply: str
    intent: str
    action_required: bool = False
    action_data: Optional[dict] = None
