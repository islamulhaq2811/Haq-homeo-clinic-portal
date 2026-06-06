"use client"

import React, { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { api, MedicalReport } from "@/lib/api"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileTextIcon, UploadIcon, SearchIcon, CheckIcon, PhoneIcon, DownloadIcon } from "@/components/Icons"

export default function ReportsPage() {
  const [reports, setReports] = useState<MedicalReport[]>([])
  const [loading, setLoading] = useState(true)
  const [patientPhone, setPatientPhone] = useState("")
  const [patientId, setPatientId] = useState<number | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState("")
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const loadReports = async (pid?: number) => {
    setLoading(true)
    try {
      const result = pid ? await api.reports.list(pid) : await api.reports.list()
      setReports(result)
    } catch { setReports([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadReports() }, [])

  const handleLookup = async () => {
    if (!patientPhone.trim()) return
    try {
      const patient = await api.patients.getByPhone(patientPhone)
      setPatientId(patient.id)
      loadReports(patient.id)
      setUploadMsg("")
    } catch { setUploadMsg("Patient not found with that phone number.") }
  }

  const handleUpload = async () => {
    if (!uploadFile || !patientId) return
    setUploading(true)
    setUploadMsg("")
    try {
      const report = await api.reports.upload(patientId, uploadFile)
      setUploadMsg("Report uploaded and analyzed!")
      setUploadFile(null)
      if (fileRef.current) fileRef.current.value = ""
      setSelectedReport(report)
      loadReports(patientId)
    } catch { setUploadMsg("Upload failed. Please try again.") }
    finally { setUploading(false) }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="bg-white/80 backdrop-blur-xl border-b border-[var(--color-border-light)] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="w-10 h-10 rounded-xl overflow-hidden shadow-soft flex-shrink-0">
                <img src="/logo.jpeg" alt="Haq Homeo Clinic" className="w-full h-full object-cover" />
              </Link>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-[var(--color-text)]">Haq Homeo Clinic</h1>
                <p className="text-[11px] sm:text-xs text-[var(--color-text-secondary)] -mt-0.5">Medical Reports</p>
              </div>
            </div>
            <nav className="flex items-center gap-1">
              <Link href="/" className="btn-ghost text-sm">Home</Link>
              <Link href="/dashboard" className="btn-ghost text-sm">Dashboard</Link>
              <Link href="/appointments" className="btn-ghost text-sm">Appointments</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="section-heading text-xl">Report Analysis</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">Upload medical reports for AI-powered analysis and insights.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <SearchIcon size={16} className="text-brand-600" />
                  <h3 className="font-semibold text-[var(--color-text)]">Find Patient</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative mb-3">
                  <PhoneIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                  <input type="tel" placeholder="Phone number" value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                    className="input-field pl-10" />
                </div>
                <Button onClick={handleLookup} className="w-full">Look Up</Button>
                {uploadMsg && !uploadMsg.includes("success") && !uploadMsg.includes("analyzed") && (
                  <p className="mt-2 text-xs text-red-500 flex items-center gap-1">{uploadMsg}</p>
                )}
              </CardContent>
            </Card>

            {patientId && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2.5">
                    <UploadIcon size={16} className="text-brand-600" />
                    <h3 className="font-semibold text-[var(--color-text)]">Upload Report</h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-[var(--color-text-secondary)] mb-4">Supports PDF, PNG, JPG - text is extracted and analyzed.</p>
                  <label className="flex flex-col items-center justify-center gap-2.5 p-6 rounded-xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg)] cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-all duration-200 mb-4">
                    <UploadIcon size={24} className="text-[var(--color-text-tertiary)]" />
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      {uploadFile ? uploadFile.name : "Choose a file"}
                    </span>
                    <input type="file" ref={fileRef}
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                  </label>
                  <Button onClick={handleUpload} disabled={!uploadFile || uploading} className="w-full" loading={uploading}>
                    {uploading ? "Uploading..." : "Upload & Analyze"}
                  </Button>
                  {uploadMsg && (uploadMsg.includes("success") || uploadMsg.includes("analyzed")) && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600">
                      <CheckIcon size={12} /> {uploadMsg}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Reports List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <FileTextIcon size={16} className="text-brand-600" />
                  <h3 className="font-semibold text-[var(--color-text)]">
                    {patientId ? "Patient Reports" : "All Reports"}
                  </h3>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-10 text-center">
                    <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-[var(--color-text-secondary)]">Loading reports...</p>
                  </div>
                ) : reports.length === 0 ? (
                  <div className="p-10 text-center">
                    <FileTextIcon size={40} className="mx-auto mb-3 text-[var(--color-text-tertiary)]" />
                    <p className="text-sm font-medium text-[var(--color-text)] mb-1">No reports yet</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {patientId ? "Upload a report to get started." : "Look up a patient first to see their reports."}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--color-border-light)]">
                    {reports.map((r) => (
                      <div key={r.id} className="px-6 py-4 hover:bg-[var(--color-border-light)]/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                              <FileTextIcon size={16} className="text-brand-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[var(--color-text)]">
                                Report #{r.id}
                                {r.file_type && <span className="text-[var(--color-text-tertiary)] font-normal"> .{r.file_type}</span>}
                              </p>
                              <p className="text-xs text-[var(--color-text-secondary)]">{new Date(r.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <a href={api.reports.download(r.id)} download
                              className="btn-ghost text-xs px-2.5 py-1.5">
                              <DownloadIcon size={12} /> Download
                            </a>
                            <Button size="sm" variant="ghost" onClick={() => setSelectedReport(selectedReport?.id === r.id ? null : r)}>
                              {selectedReport?.id === r.id ? "Hide" : "View Analysis"}
                            </Button>
                          </div>
                        </div>

                        {/* Report Details */}
                        {selectedReport?.id === r.id && (
                          <div className="mt-4 space-y-3 bg-[var(--color-bg)] rounded-xl p-4 border border-[var(--color-border)] animate-fade-in">
                            {r.extracted_text && (
                              <div>
                                <p className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-widest mb-1.5">Extracted Text</p>
                                <p className="text-sm text-[var(--color-text)] bg-white rounded-lg p-3 border border-[var(--color-border)] max-h-32 overflow-y-auto leading-relaxed">
                                  {r.extracted_text.slice(0, 800)}{r.extracted_text.length > 800 ? "..." : ""}
                                </p>
                              </div>
                            )}
                            {r.ai_summary && (
                              <div>
                                <p className="text-[11px] font-semibold text-brand-600 uppercase tracking-widest mb-1.5">AI Summary</p>
                                <p className="text-sm text-[var(--color-text)] bg-white rounded-lg p-3 border border-brand-100 leading-relaxed">{r.ai_summary}</p>
                              </div>
                            )}
                            {r.key_findings && (
                              <div>
                                <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-widest mb-1.5">Key Findings</p>
                                <p className="text-sm text-[var(--color-text)] bg-white rounded-lg p-3 border border-amber-100 leading-relaxed">{r.key_findings}</p>
                              </div>
                            )}
                            {r.patient_explanation && (
                              <div>
                                <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-widest mb-1.5">Simple Explanation</p>
                                <p className="text-sm text-[var(--color-text)] bg-white rounded-lg p-3 border border-emerald-100 leading-relaxed">{r.patient_explanation}</p>
                              </div>
                            )}
                            {!r.ai_summary && (
                              <p className="text-sm text-[var(--color-text-tertiary)] text-center py-4">No analysis available yet.</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
