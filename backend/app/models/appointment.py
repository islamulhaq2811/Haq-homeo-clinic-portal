from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.database import Base


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_name = Column(String(100), default="Dr. Halima Haq")
    appointment_date = Column(DateTime, nullable=False)
    symptoms = Column(Text, nullable=True)
    status = Column(String(20), default="scheduled")
    created_at = Column(DateTime, server_default=func.now())

    patient = relationship("Patient", backref="appointments")
