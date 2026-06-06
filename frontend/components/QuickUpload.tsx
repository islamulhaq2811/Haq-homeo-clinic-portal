"use client"

import { useState, useRef } from "react"
import { api, MedicalReport } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { UploadIcon, CheckIcon, PhoneIcon, FileTextIcon, XIcon } from "@/components/Icons"

interface QuickUploadProps {
  onClose?: () => void
}

export default function QuickUpload({ onClose }: QuickUploadProps) {
  const [phone, setPhone] = useState("")
  const [patientId, setPatientId] = useState<number | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<MedicalReport | null>(null)
  const [error, setError] = useState("")
  const [step, setStep] = useState<"phone" | "file" | "done">("phone")
  const fileRef = useRef<HTMLInputElement>(null)

  const handleLookup = async () => {
    if (!phone.trim()) return
    setError("")
    try {
      const patient = await api.patients.getByPhone(phone)
      setPatientId(patient.id)
      setStep("file")
    } catch {
      setError("Patient not found. Please check the phone number.")
    }
  }

  const handleUpload = async () => {
    if (!file || !patientId) return
    setUploading(true)
    setError("")
    try {
      const report = await api.reports.upload(patientId, file)
      setResult(report)
      setStep("done")
    } catch {
      setError("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const reset = () => {
    setPhone("")
    setPatientId(null)
    setFile(null)
    setResult(null)
    setError("")
    setStep("phone")
    if (fileRef.current) fileRef.current.value = ""
  }

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-card overflow-hidden animate-scale-in">
      <div className="px-6 py-4 border-b border-[var(--color-border-light)] flex items-center justify-between">
        <h3 className="font-semibold text-[var(--color-text)] flex items-center gap-2">
          <UploadIcon size={16} className="text-brand-600" />
          Upload Medical Report
        </h3>
        {onClose && (
          <button onClick={onClose} className="btn-ghost p-1">
            <XIcon size={16} />
          </button>
        )}
      </div>

      <div className="p-6">
        {step === "phone" && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Enter your phone number to find your patient record.
            </p>
            <div className="relative">
              <PhoneIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
              <input
                type="tel"
                placeholder="03XX-XXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                className="input-field pl-10"
              />
            </div>
            <Button onClick={handleLookup} className="w-full">
              Find My Record
            </Button>
          </div>
        )}

        {step === "file" && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Select a medical report file (PDF, PNG, JPG).
            </p>
            <label className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg)] cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-all duration-200">
              <UploadIcon size={28} className="text-[var(--color-text-tertiary)]" />
              <span className="text-sm text-[var(--color-text-secondary)]">
                {file ? file.name : "Click to choose a file"}
              </span>
              <input
                type="file"
                ref={fileRef}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
              />
            </label>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep("phone")}>
                Back
              </Button>
              <Button onClick={handleUpload} disabled={!file || uploading} className="flex-1" loading={uploading}>
                {uploading ? "Analyzing..." : "Upload & Analyze"}
              </Button>
            </div>
          </div>
        )}

        {step === "done" && result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckIcon size={16} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-800">Report uploaded & analyzed</p>
                <p className="text-xs text-emerald-600">AI analysis complete</p>
              </div>
            </div>

            {result.ai_summary && (
              <div>
                <p className="text-[11px] font-semibold text-brand-600 uppercase tracking-widest mb-1.5">AI Summary</p>
                <p className="text-sm text-[var(--color-text)] bg-brand-50/50 rounded-xl p-4 border border-brand-100 leading-relaxed">
                  {result.ai_summary}
                </p>
              </div>
            )}
            {result.key_findings && (
              <div>
                <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-widest mb-1.5">Key Findings</p>
                <p className="text-sm text-[var(--color-text)] bg-amber-50/50 rounded-xl p-4 border border-amber-100 leading-relaxed">
                  {result.key_findings}
                </p>
              </div>
            )}
            {result.patient_explanation && (
              <div>
                <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-widest mb-1.5">Simple Explanation</p>
                <p className="text-sm text-[var(--color-text)] bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 leading-relaxed">
                  {result.patient_explanation}
                </p>
              </div>
            )}

            <Button variant="secondary" onClick={reset} className="w-full">
              Upload Another
            </Button>
          </div>
        )}

        {error && (
          <p className="mt-4 text-xs text-red-500 flex items-center gap-1.5">
            <XIcon size={12} /> {error}
          </p>
        )}
      </div>
    </div>
  )
}
