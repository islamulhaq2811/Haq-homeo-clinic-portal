from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models.appointment import Appointment
from app.schemas.appointment import AppointmentCreate, AppointmentResponse

router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.post("/", response_model=AppointmentResponse)
def create_appointment(data: AppointmentCreate, db: Session = Depends(get_db)):
    appointment = Appointment(**data.model_dump())
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment


@router.get("/", response_model=list[AppointmentResponse])
def list_appointments(
    status: str | None = None,
    patient_id: int | None = None,
    db: Session = Depends(get_db),
):
    q = db.query(Appointment)
    if status:
        q = q.filter(Appointment.status == status)
    if patient_id:
        q = q.filter(Appointment.patient_id == patient_id)
    return q.order_by(Appointment.appointment_date.asc()).all()


@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(appointment_id: int, db: Session = Depends(get_db)):
    apt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not apt:
        raise HTTPException(404, "Appointment not found")
    return apt


@router.patch("/{appointment_id}/status")
def update_appointment_status(
    appointment_id: int, status: str, db: Session = Depends(get_db)
):
    apt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not apt:
        raise HTTPException(404, "Appointment not found")
    apt.status = status
    db.commit()
    return {"message": "Status updated", "status": status}


@router.get("/available-slots/")
def get_available_slots(date: str, db: Session = Depends(get_db)):
    try:
        target = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(400, "Invalid date format. Use YYYY-MM-DD")

    booked = db.query(Appointment).filter(
        Appointment.appointment_date >= target,
        Appointment.appointment_date < target.replace(hour=23, minute=59),
        Appointment.status != "cancelled",
    ).all()

    all_slots = [f"{h:02d}:00" for h in range(9, 17)]
    booked_slots = [a.appointment_date.strftime("%H:%M") for a in booked]
    available = [s for s in all_slots if s not in booked_slots]

    return {"date": date, "available_slots": available}
