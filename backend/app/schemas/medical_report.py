from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MedicalReportResponse(BaseModel):
    id: int
    patient_id: int
    file_url: str
    file_type: Optional[str] = None
    extracted_text: Optional[str] = None
    ai_summary: Optional[str] = None
    key_findings: Optional[str] = None
    patient_explanation: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
