const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || `Request failed: ${res.status}`)
  }
  return res.json()
}

export interface Patient {
  id: number
  name: string
  age: number | null
  gender: string | null
  phone: string
  created_at: string
}

export interface Appointment {
  id: number
  patient_id: number
  doctor_name: string
  appointment_date: string
  symptoms: string | null
  status: string
  created_at: string
}

export interface MedicalReport {
  id: number
  patient_id: number
  file_url: string
  file_type: string | null
  extracted_text: string | null
  ai_summary: string | null
  key_findings: string | null
  patient_explanation: string | null
  created_at: string
}

export interface ChatResponse {
  reply: string
  intent: string
  action_required: boolean
  action_data: Record<string, unknown> | null
}

export interface DashboardData {
  stats: {
    total_patients: number
    total_appointments: number
    total_reports: number
    today_appointments: number
  }
  upcoming_appointments: Array<{
    id: number
    patient_name: string
    patient_phone: string
    date: string
    symptoms: string | null
    status: string
  }>
  recent_patients: Array<{
    id: number
    name: string
    phone: string
    created_at: string
  }>
}

export interface AvailableSlots {
  date: string
  available_slots: string[]
}

export const api = {
  patients: {
    create: (data: { name: string; age?: number; gender?: string; phone: string }) =>
      request<Patient>("/patients/", { method: "POST", body: JSON.stringify(data) }),
    list: () => request<Patient[]>("/patients/"),
    get: (id: number) => request<Patient>(`/patients/${id}`),
    getByPhone: (phone: string) => request<Patient>(`/patients/phone/${encodeURIComponent(phone)}`),
  },

  appointments: {
    create: (data: { patient_id: number; appointment_date: string; symptoms?: string }) =>
      request<Appointment>("/appointments/", { method: "POST", body: JSON.stringify(data) }),
    list: (params?: { status?: string; patient_id?: number }) => {
      const q = new URLSearchParams()
      if (params?.status) q.set("status", params.status)
      if (params?.patient_id) q.set("patient_id", String(params.patient_id))
      const qs = q.toString()
      return request<Appointment[]>(`/appointments/${qs ? "?" + qs : ""}`)
    },
    get: (id: number) => request<Appointment>(`/appointments/${id}`),
    updateStatus: (id: number, status: string) =>
      request<{ message: string; status: string }>(`/appointments/${id}/status?status=${status}`, { method: "PATCH" }),
    availableSlots: (date: string) =>
      request<AvailableSlots>(`/appointments/available-slots/?date=${date}`),
  },

  reports: {
    upload: async (patient_id: number, file: File) => {
      const form = new FormData()
      form.append("patient_id", String(patient_id))
      form.append("file", file)
      const res = await fetch(`${API_BASE}/reports/upload`, { method: "POST", body: form })
      if (!res.ok) throw new Error("Upload failed")
      return res.json() as Promise<MedicalReport>
    },
    analyze: (id: number) =>
      request<MedicalReport>(`/reports/${id}/analyze`, { method: "POST" }),
    extractText: (id: number, text: string) =>
      request<MedicalReport>(`/reports/${id}/extract-text`, { method: "POST", body: JSON.stringify({ text }) }),
    list: (patient_id?: number) => {
      const q = patient_id ? `?patient_id=${patient_id}` : ""
      return request<MedicalReport[]>(`/reports/${q}`)
    },
    get: (id: number) => request<MedicalReport>(`/reports/${id}`),
    download: (id: number) => `${API_BASE}/reports/download/${id}`,
  },

  ai: {
    chat: (data: { patient_id?: number; phone?: string; message: string }) =>
      request<ChatResponse>("/ai/chat", { method: "POST", body: JSON.stringify(data) }),
  },

  admin: {
    dashboard: () => request<DashboardData>("/admin/dashboard"),
  },
}
