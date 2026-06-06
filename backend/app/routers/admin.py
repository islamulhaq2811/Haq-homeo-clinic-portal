from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.database import get_db
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.medical_report import MedicalReport

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    total_patients = db.query(Patient).count()
    total_appointments = db.query(Appointment).count()
    total_reports = db.query(MedicalReport).count()

    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    today_appointments = (
        db.query(Appointment)
        .filter(Appointment.appointment_date >= today)
        .count()
    )

    upcoming = (
        db.query(Appointment)
        .filter(
            Appointment.appointment_date >= datetime.now(),
            Appointment.status == "scheduled",
        )
        .order_by(Appointment.appointment_date.asc())
        .limit(10)
        .all()
    )

    recent_patients = (
        db.query(Patient).order_by(Patient.created_at.desc()).limit(5).all()
    )

    return {
        "stats": {
            "total_patients": total_patients,
            "total_appointments": total_appointments,
            "total_reports": total_reports,
            "today_appointments": today_appointments,
        },
        "upcoming_appointments": [
            {
                "id": a.id,
                "patient_name": a.patient.name,
                "patient_phone": a.patient.phone,
                "date": a.appointment_date.isoformat(),
                "symptoms": a.symptoms,
                "status": a.status,
            }
            for a in upcoming
        ],
        "recent_patients": [
            {"id": p.id, "name": p.name, "phone": p.phone, "created_at": p.created_at.isoformat()}
            for p in recent_patients
        ],
    }
