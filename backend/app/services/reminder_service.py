from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.appointment import Appointment


def get_appointments_for_reminder(db: Session, hours_ahead: int = 24) -> list[dict]:
    now = datetime.now()
    window_end = now + timedelta(hours=hours_ahead)

    appointments = (
        db.query(Appointment)
        .filter(
            Appointment.appointment_date >= now,
            Appointment.appointment_date <= window_end,
            Appointment.status == "scheduled",
        )
        .all()
    )

    reminders = []
    for apt in appointments:
        reminders.append(
            {
                "patient_name": apt.patient.name,
                "patient_phone": apt.patient.phone,
                "appointment_date": apt.appointment_date.isoformat(),
                "doctor": apt.doctor_name,
                "message": f"Reminder: You have an appointment with {apt.doctor_name} on {apt.appointment_date.strftime('%A, %B %d at %I:%M %p')}.",
            }
        )
    return reminders
