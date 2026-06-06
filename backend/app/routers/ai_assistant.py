import re
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.chat_message import ChatMessage
from app.schemas.ai_assistant import ChatRequest, ChatResponse
from app.services.ai_service import process_chat_message

router = APIRouter(prefix="/ai", tags=["AI Assistant"])

WEEKDAYS = {
    "monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3,
    "friday": 4, "saturday": 5, "sunday": 6,
}


def _extract_name(text: str) -> str | None:
    patterns = [
        r"my name is (\w+(?:\s+\w+)?)",
        r"i am (\w+(?:\s+\w+)?)",
        r"call me (\w+(?:\s+\w+)?)",
        r"name[:\s]+(\w+(?:\s+\w+)?)",
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            return m.group(1).strip().title()
    return None


def _extract_phone(text: str) -> str | None:
    cleaned = re.sub(r"[\s-]", "", text)
    m = re.search(r"03\d{9}", cleaned)
    if m:
        return m.group(0)
    m = re.search(r"(\+?\d{10,15})", cleaned)
    return m.group(1) if m else None


def _extract_symptoms(text: str) -> str:
    msg_lower = text.lower()
    keywords = [
        "fever", "pain", "headache", "cough", "cold", "vomiting",
        "infection", "stomach", "nausea", "body ache", "diarrhea", "flu",
        "symptom",
    ]
    found = [k for k in keywords if k in msg_lower]
    return ", ".join(found) if found else ""


def _parse_date(text: str) -> datetime | None:
    msg_lower = text.lower()
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

    if "tomorrow" in msg_lower:
        base = today + timedelta(days=1)
    elif "next week" in msg_lower:
        base = today + timedelta(weeks=1)
    elif "today" in msg_lower:
        base = today
    else:
        for name, idx in WEEKDAYS.items():
            if name in msg_lower:
                days_ahead = idx - today.weekday()
                if days_ahead <= 0:
                    days_ahead += 7
                base = today + timedelta(days=days_ahead)
                break
        else:
            m = re.search(r"(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})", text)
            if m:
                d, mo, y = int(m.group(1)), int(m.group(2)), int(m.group(3))
                if y < 100:
                    y += 2000
                try:
                    return datetime(y, mo, d, 9, 0)
                except ValueError:
                    return None
            return None

    time_match = re.search(r"(\d{1,2})(?::(\d{2}))?\s*(am|pm)", msg_lower)
    hour = 9
    minute = 0
    if time_match:
        hour = int(time_match.group(1))
        minute = int(time_match.group(2)) if time_match.group(2) else 0
        if time_match.group(3) == "pm" and hour < 12:
            hour += 12
        if time_match.group(3) == "am" and hour == 12:
            hour = 0
    return base.replace(hour=hour, minute=minute)


def _save_message(db: Session, role: str, content: str, patient_id: int | None = None, intent: str | None = None):
    msg = ChatMessage(role=role, content=content, patient_id=patient_id, intent=intent)
    db.add(msg)
    db.commit()


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    patient = None
    if request.patient_id:
        patient = db.query(Patient).filter(Patient.id == request.patient_id).first()
    elif request.phone:
        patient = db.query(Patient).filter(Patient.phone == request.phone).first()

    context = {}
    if patient:
        appointments = (
            db.query(Appointment)
            .filter(Appointment.patient_id == patient.id)
            .order_by(Appointment.appointment_date.desc())
            .limit(5)
            .all()
        )
        context = {
            "patient_name": patient.name,
            "patient_age": patient.age,
            "patient_gender": patient.gender,
            "recent_appointments": [
                {"date": a.appointment_date.isoformat(), "symptoms": a.symptoms, "status": a.status}
                for a in appointments
            ],
        }

    result = process_chat_message(request.message, context)
    intent = result.get("intent", "general")
    reply = result.get("reply", "")
    action_required = False
    action_data = None

    if intent == "provide_info":
        name = _extract_name(request.message)
        phone = _extract_phone(request.message)
        symptoms = _extract_symptoms(request.message)

        if name and phone:
            existing = db.query(Patient).filter(Patient.phone == phone).first()
            if existing:
                patient = existing
                reply = f"Welcome back, {patient.name}! "
            else:
                patient = Patient(name=name, phone=phone)
                db.add(patient)
                db.commit()
                db.refresh(patient)
                reply = f"Thank you, {patient.name}! I've registered you in our system. "

            reply += "I can help you book an appointment with Dr. Halima Haq. Please tell me your preferred date and time (e.g., tomorrow at 10 AM)."
            action_required = True
            action_data = {
                "action": "book_appointment",
                "patient_id": patient.id,
                "patient_name": patient.name,
                "symptoms": symptoms,
            }

    elif intent == "book_appointment":
        if patient:
            parsed_date = _parse_date(request.message)
            if parsed_date:
                symptoms = _extract_symptoms(request.message) or (result.get("symptoms") if result.get("symptoms") != request.message else "")

                appointment = Appointment(
                    patient_id=patient.id,
                    doctor_name="Dr. Halima Haq",
                    appointment_date=parsed_date,
                    symptoms=symptoms,
                )
                db.add(appointment)
                db.commit()
                db.refresh(appointment)

                reply = (
                    f"Your appointment with Dr. Halima Haq has been confirmed for "
                    f"{parsed_date.strftime('%A, %B %d at %I:%M %p')}. "
                    f"We look forward to seeing you!"
                )
                action_required = True
                action_data = {
                    "action": "appointment_confirmed",
                    "appointment_id": appointment.id,
                    "patient_id": patient.id,
                    "date": parsed_date.isoformat(),
                }
            else:
                reply = "I understand. Could you please specify a date? For example: 'tomorrow at 10 AM' or 'next Monday at 2 PM'."
                action_required = True
                action_data = {
                    "action": "book_appointment",
                    "patient_id": patient.id,
                }

    elif intent == "check_appointment" and patient:
        upcoming = (
            db.query(Appointment)
            .filter(
                Appointment.patient_id == patient.id,
                Appointment.appointment_date >= datetime.now(),
                Appointment.status == "scheduled",
            )
            .order_by(Appointment.appointment_date.asc())
            .first()
        )
        if upcoming:
            reply += f"\n\nYour next appointment is on {upcoming.appointment_date.strftime('%A, %B %d at %I:%M %p')}."
        else:
            reply += "\n\nYou have no upcoming appointments. Would you like to book one?"

    _save_message(db, "user", request.message, patient.id if patient else None)
    _save_message(db, "assistant", reply, patient.id if patient else None, intent)

    return ChatResponse(
        reply=reply,
        intent=intent,
        action_required=action_required,
        action_data=action_data,
    )


@router.get("/messages")
def get_messages(patient_id: int | None = None, limit: int = 50, db: Session = Depends(get_db)):
    q = db.query(ChatMessage).order_by(ChatMessage.created_at.desc())
    if patient_id:
        q = q.filter(ChatMessage.patient_id == patient_id)
    messages = q.limit(limit).all()
    messages.reverse()
    return [
        {"id": m.id, "role": m.role, "content": m.content, "intent": m.intent, "created_at": m.created_at.isoformat()}
        for m in messages
    ]
