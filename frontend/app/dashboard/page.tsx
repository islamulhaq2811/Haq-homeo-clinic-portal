"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { api, DashboardData } from "@/lib/api"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CalendarIcon, UsersIcon, FileTextIcon, ClockIcon, PhoneIcon } from "@/components/Icons"

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.admin.dashboard().then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[var(--color-text-secondary)]">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  const statCards = [
    { icon: UsersIcon, label: "Total Patients", value: data?.stats.total_patients ?? 0, color: "from-brand-500 to-emerald-500" },
    { icon: CalendarIcon, label: "Appointments", value: data?.stats.total_appointments ?? 0, color: "from-amber-400 to-orange-400" },
    { icon: FileTextIcon, label: "Medical Reports", value: data?.stats.total_reports ?? 0, color: "from-violet-500 to-purple-500" },
    { icon: ClockIcon, label: "Today's Visits", value: data?.stats.today_appointments ?? 0, color: "from-sky-500 to-cyan-500" },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-[var(--color-border-light)] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="w-10 h-10 rounded-xl overflow-hidden shadow-soft flex-shrink-0">
                <img src="/logo.jpeg" alt="Haq Homeo Clinic" className="w-full h-full object-cover" />
              </Link>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-[var(--color-text)]">Haq Homeo Clinic</h1>
                <p className="text-[11px] sm:text-xs text-[var(--color-text-secondary)] -mt-0.5">Dashboard</p>
              </div>
            </div>
            <nav className="flex items-center gap-1">
              <Link href="/" className="btn-ghost text-sm">Home</Link>
              <Link href="/appointments" className="btn-ghost text-sm">Appointments</Link>
              <Link href="/reports" className="btn-ghost text-sm">Reports</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label}>
                <CardContent className="py-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-soft`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[var(--color-text)]">{stat.value}</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Charts / Lists */}
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
                  {data.upcoming_appointments.map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-[var(--color-border-light)] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center">
                          <UsersIcon size={14} className="text-brand-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-[var(--color-text)]">{apt.patient_name}</p>
                          <p className="text-xs text-[var(--color-text-secondary)]">
                            {new Date(apt.date).toLocaleDateString("en-US", {
                              weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <span className={`badge ${
                        apt.status === "scheduled" ? "badge-blue" :
                        apt.status === "completed" ? "badge-green" : "badge-amber"
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <CalendarIcon size={36} className="mx-auto mb-3 text-[var(--color-text-tertiary)]" />
                  <p className="text-sm text-[var(--color-text-secondary)]">No upcoming appointments</p>
                </div>
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
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center">
                          <UsersIcon size={14} className="text-brand-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-[var(--color-text)]">{p.name}</p>
                          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                            <PhoneIcon size={10} />
                            {p.phone}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-[var(--color-text-tertiary)]">{new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <UsersIcon size={36} className="mx-auto mb-3 text-[var(--color-text-tertiary)]" />
                  <p className="text-sm text-[var(--color-text-secondary)]">No patients yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
