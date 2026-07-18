import json
import re
from openai import OpenAI
from app.config import GROQ_API_KEY, GROQ_BASE_URL, GROQ_MODEL, OPENAI_API_KEY

api_key = GROQ_API_KEY or OPENAI_API_KEY
base_url = GROQ_BASE_URL if GROQ_API_KEY else None
client = OpenAI(api_key=api_key, base_url=base_url) if GROQ_API_KEY else OpenAI(api_key=OPENAI_API_KEY)

SYMPTOM_SYSTEM_PROMPT = """You are a medical assistant for Haq Homeo Clinic (Dr. Halima Haq, homeopathic practitioner).

Your role:
- Understand patient symptoms and concerns
- Recommend consultation with Dr. Halima Haq when appropriate
- Help book appointments
- Answer general clinic questions

IMPORTANT MEDICAL DISCLAIMER:
- You do NOT diagnose diseases
- You do NOT prescribe medicines
- You only assist with appointment handling and information gathering

Always respond in a warm, professional tone. Keep responses concise (2-3 sentences).
The clinic is run by Dr. Halima Haq, a homeopathic practitioner.

Analyze the patient's message and return a JSON with:
- "intent": one of ["book_appointment", "check_appointment", "ask_symptoms", "general", "report_upload"]
- "symptoms": extracted symptoms (if any)
- "severity": "mild", "moderate", or "severe" (if applicable)
- "reply": your friendly response to the patient"""

REPORT_SYSTEM_PROMPT = """You are a medical report analyst for Haq Homeo Clinic.

Given the extracted text from a medical report:
1. Provide a short AI summary (2-3 sentences)
2. List key findings (abnormal values, notable observations)
3. Provide a simple patient explanation in plain language

IMPORTANT: Do NOT diagnose. Only summarize what the report says.
Return JSON with keys: "summary", "key_findings", "patient_explanation"."""


def _model() -> str:
    return GROQ_MODEL if GROQ_API_KEY else "gpt-4o-mini"


def _has_api_key() -> bool:
    return bool(GROQ_API_KEY or OPENAI_API_KEY)


def process_chat_message(message: str, context: dict | None = None) -> dict:
    if not _has_api_key():
        return _fallback_chat_response(message)

    user_context = ""
    if context and context.get("patient_name"):
        user_context = f"The patient is {context['patient_name']}."

    try:
        response = client.chat.completions.create(
            model=_model(),
            messages=[
                {"role": "system", "content": SYMPTOM_SYSTEM_PROMPT},
                {"role": "user", "content": f"{user_context}\n\nPatient message: {message}"},
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
        )
        return json.loads(response.choices[0].message.content)
    except Exception:
        return _fallback_chat_response(message)


def analyze_medical_report(extracted_text: str) -> dict:
    if not _has_api_key() or not extracted_text.strip():
        return {
            "summary": "Report text not available for analysis.",
            "key_findings": "N/A",
            "patient_explanation": "Please upload a readable report.",
        }

    try:
        response = client.chat.completions.create(
            model=_model(),
            messages=[
                {"role": "system", "content": REPORT_SYSTEM_PROMPT},
                {"role": "user", "content": f"Report text:\n{extracted_text}"},
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
        )
        return json.loads(response.choices[0].message.content)
    except Exception:
        return {
            "summary": "AI analysis temporarily unavailable.",
            "key_findings": "Could not process report.",
            "patient_explanation": "Please try again later or contact the clinic.",
        }


def _fallback_chat_response(message: str) -> dict:
    msg_lower = message.lower()

    has_name = bool(re.search(r"(my name is|i am|call me|name[:\s]+)", msg_lower))
    has_phone = bool(re.search(r"(03\d{2,}|phone|contact|number)", msg_lower))
    has_date = bool(re.search(r"(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|today|tomorrow|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)", msg_lower))
    symptoms_keywords = ["fever", "pain", "headache", "cough", "cold", "vomiting", "infection", "stomach", "nausea", "body ache"]

    has_symptoms = any(s in msg_lower for s in symptoms_keywords)

    if has_name and has_phone:
        return {
            "intent": "provide_info",
            "symptoms": message,
            "severity": "moderate",
            "reply": "Thank you! I have noted your details. Let me suggest available slots for your appointment with Dr. Halima Haq. Please tell me your preferred date or I can show you this week's availability.",
        }

    if has_date and has_symptoms:
        return {
            "intent": "book_appointment",
            "symptoms": message,
            "severity": "moderate",
            "reply": "Thank you! I'll book your appointment with Dr. Halima Haq. Let me check the available slots and confirm your booking shortly.",
        }

    if has_symptoms:
        return {
            "intent": "book_appointment",
            "symptoms": message,
            "severity": "moderate",
            "reply": "I understand you're not feeling well. I recommend booking a consultation with Dr. Halima Haq. Could you please share your name and phone number so I can schedule an appointment?",
        }

    if has_date:
        return {
            "intent": "book_appointment",
            "symptoms": "",
            "severity": "mild",
            "reply": "Thank you! Let me check the available slots for that date and confirm your appointment with Dr. Halima Haq.",
        }

    if "check" in msg_lower or "status" in msg_lower:
        return {
            "intent": "check_appointment",
            "symptoms": "",
            "severity": "mild",
            "reply": "Let me check your appointment status for you. Please provide your phone number so I can look up your records.",
        }

    if "report" in msg_lower or "upload" in msg_lower:
        return {
            "intent": "report_upload",
            "symptoms": "",
            "severity": "mild",
            "reply": "You can upload your medical report on the Reports page. I'll analyze it and provide a summary for you.",
        }

    if "appointment" in msg_lower or "book" in msg_lower:
        return {
            "intent": "book_appointment",
            "symptoms": message,
            "severity": "moderate",
            "reply": "I'd be happy to help you book an appointment with Dr. Halima Haq. Please share your name, phone number, and preferred date.",
        }

    if "yes" in msg_lower or "ok" in msg_lower or "sure" in msg_lower or "please" in msg_lower:
        return {
            "intent": "book_appointment",
            "symptoms": "",
            "severity": "mild",
            "reply": "Great! To book an appointment with Dr. Halima Haq, I need your name, phone number, and preferred date. Please share your details.",
        }

    return {
        "intent": "general",
        "symptoms": "",
        "severity": "mild",
        "reply": "Welcome to Haq Homeo Clinic! I'm your AI assistant. I can help you book appointments, check appointment status, upload medical reports, or answer questions about Dr. Halima Haq's clinic. How can I assist you today?",
    }
