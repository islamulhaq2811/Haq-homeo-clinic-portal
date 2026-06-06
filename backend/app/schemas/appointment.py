from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AppointmentCreate(BaseModel):
    patient_id: int
    appointment_date: datetime
    symptoms: Optional[str] = None


class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    doctor_name: str
    appointment_date: datetime
    symptoms: Optional[str] = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
