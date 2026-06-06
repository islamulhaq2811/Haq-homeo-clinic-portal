"use client"

import React, { useEffect, useState } from "react"
import { authApi } from "@/lib/auth"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { UsersIcon, CalendarIcon, FileTextIcon, ClockIcon, PhoneIcon } from "@/components/Icons"

export default function AdminDashboard() {
  const [data, setData] = useState<{
    stats: { total_patients: number; total_appointments: number; total_reports: number; today_appointments: number }
    upcoming_appointments: Array<{ id: number; patient_name: string; patient_phone: string; date: string; symptoms: string | null; status: string }>
    recent_patients: Array<{ id: number; name: string; phone: string; created_at: string }>
  } | null>(null)

  useEffect(() => { authApi.dashboard().then(setData) }, [])

  const stats = [
    { icon: UsersIcon, label: "Total Patients", value: data?.stats.total_patients ?? 0, color: "from-brand-500 to-emerald-500" },
    { icon: CalendarIcon, label: "Appointments", value: data?.stats.total_appointments ?? 0, color: "from-amber-400 to-orange-400" },
    { icon: FileTextIcon, label: "Medical Reports", value: data?.stats.total_reports ?? 0, color: "from-violet-500 to-purple-500" },
    { icon: ClockIcon, label: "Today's Visits", value: data?.stats.today_appointments ?? 0, color: "from-sky-500 to-cyan-500" },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-[var(--color-text)]">Dashboard</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">Overview of your clinic activity</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label}>
              <CardContent className="py-5">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-soft`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--color-text)]">{s.value}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <CalendarIcon size={16} className="text-brand-600" />
              <h3 className="font-semibold text-[var(--color-text)]">Upcoming Appointments</h3>
            </div>
          </CardHeader>
          <CardContent>
            {data?.upcoming_appointments?.length ? (
              <div className="space-y-1 -mx-2">
                {data.upcoming_appointments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-[var(--color-border-light)] transition-colors">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text)]">{a.patient_name}</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">{new Date(a.date).toLocaleString()}</p>
                    </div>
                    <span className={`badge ${a.status === "scheduled" ? "badge-blue" : "badge-green"}`}>{a.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-[var(--color-text-secondary)]">No upcoming appointments</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <UsersIcon size={16} className="text-brand-600" />
              <h3 className="font-semibold text-[var(--color-text)]">Recent Patients</h3>
            </div>
          </CardHeader>
          <CardContent>
            {data?.recent_patients?.length ? (
              <div className="space-y-1 -mx-2">
                {data.recent_patients.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-[var(--color-border-light)] transition-colors">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text)]">{p.name}</p>
                      <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                        <PhoneIcon size={10} />{p.phone}
                      </div>
                    </div>
                    <span className="text-xs text-[var(--color-text-tertiary)]">{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-[var(--color-text-secondary)]">No patients yet</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
