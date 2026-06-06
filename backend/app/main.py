from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import engine, Base
from app.config import UPLOAD_DIR
from app.routers import patients, appointments, medical_reports, ai_assistant, admin, auth
from app.seed import seed_default_admin

import os

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Haq Homeo Clinic",
    description="AI-Powered Appointment & Medical Report Management System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(patients.router)
app.include_router(appointments.router)
app.include_router(medical_reports.router)
app.include_router(ai_assistant.router)
app.include_router(admin.router)
app.include_router(auth.router)


@app.on_event("startup")
def on_startup():
    seed_default_admin()


@app.get("/")
def root():
    return {
        "message": "Welcome to Haq Homeo Clinic API",
        "version": "1.0.0",
        "doctor": "Dr. Halima Haq",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}
