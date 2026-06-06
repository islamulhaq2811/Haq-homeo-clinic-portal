from sqlalchemy import Column, Integer, String, DateTime, func
from app.database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String(10), nullable=True)
    phone = Column(String(20), unique=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
