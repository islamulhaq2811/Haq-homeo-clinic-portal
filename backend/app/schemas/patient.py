from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PatientCreate(BaseModel):
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: str


class PatientResponse(BaseModel):
    id: int
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: str
    created_at: datetime

    model_config = {"from_attributes": True}
