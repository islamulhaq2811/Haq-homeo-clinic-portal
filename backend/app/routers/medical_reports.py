import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Body
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models.medical_report import MedicalReport
from app.schemas.medical_report import MedicalReportResponse
from app.services.ai_service import analyze_medical_report
from app.services.ocr_service import extract_text_from_file
from app.config import UPLOAD_DIR

router = APIRouter(prefix="/reports", tags=["Medical Reports"])

os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload", response_model=MedicalReportResponse)
async def upload_report(
    patient_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)

    file_url = f"/uploads/{filename}"
    file_type = ext

    report = MedicalReport(
        patient_id=patient_id,
        file_url=file_url,
        file_type=file_type,
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    extracted = await extract_text_from_file(filepath)
    if extracted and "Could not extract" not in extracted:
        report.extracted_text = extracted
        result = analyze_medical_report(extracted)
        report.ai_summary = result.get("summary")
        report.key_findings = result.get("key_findings")
        report.patient_explanation = result.get("patient_explanation")
        db.commit()
        db.refresh(report)

    return report


@router.get("/download/{report_id}")
def download_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    if not report:
        raise HTTPException(404, "Report not found")
    filepath = os.path.join(UPLOAD_DIR, os.path.basename(report.file_url))
    if not os.path.exists(filepath):
        raise HTTPException(404, "File not found on disk")
    return FileResponse(filepath, filename=f"report_{report_id}{os.path.splitext(filepath)[1]}")


@router.post("/{report_id}/analyze", response_model=MedicalReportResponse)
def analyze_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    if not report:
        raise HTTPException(404, "Report not found")
    result = analyze_medical_report(report.extracted_text or "")
    report.ai_summary = result.get("summary")
    report.key_findings = result.get("key_findings")
    report.patient_explanation = result.get("patient_explanation")
    db.commit()
    db.refresh(report)
    return report


@router.post("/{report_id}/extract-text", response_model=MedicalReportResponse)
def extract_text(report_id: int, data: dict = Body(...), db: Session = Depends(get_db)):
    text = data.get("text", "")
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    if not report:
        raise HTTPException(404, "Report not found")
    report.extracted_text = text
    db.commit()
    db.refresh(report)
    return report


@router.get("/", response_model=list[MedicalReportResponse])
def list_reports(patient_id: int | None = None, db: Session = Depends(get_db)):
    q = db.query(MedicalReport)
    if patient_id:
        q = q.filter(MedicalReport.patient_id == patient_id)
    return q.order_by(MedicalReport.created_at.desc()).all()


@router.get("/{report_id}", response_model=MedicalReportResponse)
def get_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    if not report:
        raise HTTPException(404, "Report not found")
    return report
