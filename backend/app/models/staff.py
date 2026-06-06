from sqlalchemy import Column, Integer, String, DateTime, func
from app.database import Base


class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    full_name = Column(String(100), nullable=True)
    role = Column(String(20), default="admin")
    created_at = Column(DateTime, server_default=func.now())
