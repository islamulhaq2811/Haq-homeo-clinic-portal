interface DashboardResponse {
  stats: { total_patients: number; total_appointments: number; total_reports: number; today_appointments: number }
  upcoming_appointments: Array<{ id: number; patient_name: string; patient_phone: string; date: string; symptoms: string | null; status: string }>
  recent_patients: Array<{ id: number; name: string; phone: string; created_at: string }>
}

interface PatientResponse {
  id: number; name: string; age: number | null; gender: string | null; phone: string; created_at: string
}

interface AppointmentResponse {
  id: number; patient_id: number; doctor_name: string; appointment_date: string; symptoms: string | null; status: string; created_at: string
}

interface ReportResponse {
  id: number; patient_id: number; file_url: string; file_type: string | null; extracted_text: string | null; ai_summary: string | null; created_at: string
}

const TOKEN_KEY = "haq_admin_token"
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

async function authFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  })
  if (res.status === 401) {
    clearToken()
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login"
    }
    throw new Error("Unauthorized")
  }
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || `Request failed: ${res.status}`)
  }
  return res.json()
}

export const authApi = {
  login: (username: string, password: string) =>
    authFetch<{ token: string; staff: Record<string, unknown> }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  me: () => authFetch<{ id: number; username: string; full_name: string; role: string }>("/auth/me"),

  dashboard: () => authFetch<DashboardResponse>("/admin/dashboard"),

  patients: {
    list: () => authFetch<PatientResponse[]>("/patients/"),
    get: (id: number) => authFetch<Record<string, unknown>>(`/patients/${id}`),
  },

  appointments: {
    list: () => authFetch<AppointmentResponse[]>("/appointments/"),
    cancel: (id: number) => authFetch<{ message: string }>(`/appointments/${id}/status?status=cancelled`, { method: "PATCH" }),
  },

  reports: {
    list: () => authFetch<ReportResponse[]>("/reports/"),
  },

  messages: (patient_id?: number) => {
    const q = patient_id ? `?patient_id=${patient_id}` : ""
    return authFetch<Array<{ id: number; role: string; content: string; intent: string | null; created_at: string }>>(`/ai/messages${q}`)
  },
}
