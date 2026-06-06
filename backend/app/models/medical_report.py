from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.database import Base


class MedicalReport(Base):
    __tablename__ = "medical_reports"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_type = Column(String(20), nullable=True)
    extracted_text = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)
    key_findings = Column(Text, nullable=True)
    patient_explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    patient = relationship("Patient", backref="medical_reports")
