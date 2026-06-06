"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { api, Appointment, AvailableSlots } from "@/lib/api"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ClockIcon, XIcon, CheckIcon, PlusIcon } from "@/components/Icons"

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [showBooking, setShowBooking] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [age, setAge] = useState("")
  const [symptoms, setSymptoms] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedSlot, setSelectedSlot] = useState("")
  const [slots, setSlots] = useState<AvailableSlots | null>(null)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingMessage, setBookingMessage] = useState("")

  const loadAppointments = () => {
    setLoading(true)
    api.appointments.list().then(setAppointments).finally(() => setLoading(false))
  }

  useEffect(() => { loadAppointments() }, [])

  const handleDateChange = async (date: string) => {
    setSelectedDate(date)
    setSelectedSlot("")
    if (date) {
      try { setSlots(await api.appointments.availableSlots(date)) }
      catch { setSlots(null) }
    }
  }

  const resetBookingForm = () => {
    setShowBooking(false)
    setName("")
    setPhone("")
    setAge("")
    setSymptoms("")
    setSelectedDate("")
    setSelectedSlot("")
    setSlots(null)
    setBookingMessage("")
  }

  const handleBook = async () => {
    if (!name || !phone || !selectedDate || !selectedSlot) return
    setBookingLoading(true)
    setBookingMessage("")
    try {
      const patient = await api.patients.create({ name, phone, age: age ? Number(age) : undefined })
      await api.appointments.create({ patient_id: patient.id, appointment_date: `${selectedDate}T${selectedSlot}:00`, symptoms })
      setBookingMessage("Appointment booked successfully!")
      resetBookingForm()
      loadAppointments()
    } catch { setBookingMessage("Failed to book. Please try again.") }
    finally { setBookingLoading(false) }
  }

  const cancelAppointment = async (id: number) => {
    try {
      await api.appointments.updateStatus(id, "cancelled")
      loadAppointments()
    } catch {
      setBookingMessage("Failed to cancel. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="bg-white/80 backdrop-blur-xl border-b border-[var(--color-border-light)] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="w-10 h-10 rounded-xl overflow-hidden shadow-soft flex-shrink-0">
                <img src="/logo.jpeg" alt="Haq Homeo Clinic" className="w-full h-full object-cover" />
              </Link>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-[var(--color-text)]">Haq Homeo Clinic</h1>
                <p className="text-[11px] sm:text-xs text-[var(--color-text-secondary)] -mt-0.5">Appointments</p>
              </div>
            </div>
            <nav className="flex items-center gap-1">
              <Link href="/" className="btn-ghost text-sm">Home</Link>
              <Link href="/dashboard" className="btn-ghost text-sm">Dashboard</Link>
              <Link href="/reports" className="btn-ghost text-sm">Reports</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="section-heading text-xl">All Appointments</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">Manage and book appointments with Dr. Halima Haq</p>
          </div>
          <Button onClick={() => showBooking ? resetBookingForm() : setShowBooking(true)}>
            {showBooking ? "Close" : <><PlusIcon size={16} /> Book Appointment</>}
          </Button>
        </div>

        {/* Booking Form */}
        {showBooking && (
          <Card className="mb-8 border-l-4 border-l-brand-500 animate-scale-in">
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <CalendarIcon size={16} className="text-brand-600" />
                <h3 className="font-semibold text-[var(--color-text)]">Book with Dr. Halima Haq</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Full Name *</label>
                  <input type="text" placeholder="Enter your name" value={name}
                    onChange={(e) => setName(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="input-label">Phone *</label>
                  <input type="tel" placeholder="03XX-XXXXXXX" value={phone}
                    onChange={(e) => setPhone(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="input-label">Age</label>
                  <input type="number" placeholder="Enter age" value={age}
                    onChange={(e) => setAge(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="input-label">Date *</label>
                  <input type="date" value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)} className="input-field" />
                </div>
              </div>

              <div className="mt-4">
                <label className="input-label">Symptoms</label>
                <textarea placeholder="Describe your symptoms..." value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)} rows={3} className="input-field resize-none" />
              </div>

              {/* Available Slots */}
              {slots && (
                <div className="mt-6 animate-fade-in">
                  <div className="flex items-center gap-2 mb-3">
                    <ClockIcon size={14} className="text-brand-600" />
                    <p className="text-sm font-medium text-[var(--color-text)]">Available Slots</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {slots.available_slots.length > 0 ? (
                      slots.available_slots.map((slot) => (
                        <button key={slot} onClick={() => setSelectedSlot(slot)}
                          className={`px-4 py-2 text-sm rounded-xl border font-medium transition-all duration-200 ${
                            selectedSlot === slot
                              ? "bg-brand-500 text-white border-brand-500 shadow-[0_2px_8px_rgba(5,150,105,0.2)]"
                              : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-brand-400 hover:text-brand-600 bg-white"
                          }`}>
                          {slot}
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-[var(--color-text-tertiary)] py-2">No slots available for this date</p>
                    )}
                  </div>
                </div>
              )}

              {/* Booking Message */}
              {bookingMessage && (
                <div className={`mt-4 flex items-center gap-2 text-sm ${
                  bookingMessage.includes("success") ? "text-emerald-600" : "text-red-500"
                }`}>
                  {bookingMessage.includes("success") ? <CheckIcon size={14} /> : <XIcon size={14} />}
                  {bookingMessage}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <Button variant="ghost" onClick={resetBookingForm}>Cancel</Button>
                <Button onClick={handleBook} disabled={bookingLoading || !name || !phone || !selectedDate || !selectedSlot} loading={bookingLoading}>
                  {bookingLoading ? "Booking..." : "Confirm Booking"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Appointments List */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-10 text-center">
                <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-[var(--color-text-secondary)]">Loading appointments...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-10 text-center">
                <CalendarIcon size={40} className="mx-auto mb-3 text-[var(--color-text-tertiary)]" />
                <p className="text-sm font-medium text-[var(--color-text)] mb-1">No appointments found</p>
                <p className="text-sm text-[var(--color-text-secondary)]">Book your first appointment above.</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border-light)]">
                {appointments.map((apt) => (
                  <div key={apt.id} className="px-6 py-4 flex items-center justify-between hover:bg-[var(--color-border-light)]/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                        <CalendarIcon size={18} className="text-brand-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-[var(--color-text)]">
                          {new Date(apt.appointment_date).toLocaleDateString("en-US", {
                            weekday: "long", month: "long", day: "numeric", year: "numeric",
                          })}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <ClockIcon size={11} className="text-[var(--color-text-tertiary)]" />
                          <span className="text-sm font-medium text-brand-600">
                            {new Date(apt.appointment_date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        {apt.symptoms && (
                          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{apt.symptoms}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`badge ${
                        apt.status === "scheduled" ? "badge-blue" :
                        apt.status === "completed" ? "badge-green" : "badge-red"
                      }`}>
                        {apt.status}
                      </span>
                      {apt.status === "scheduled" && (
                        <button onClick={() => cancelAppointment(apt.id)}
                          className="text-xs text-[var(--color-text-tertiary)] hover:text-red-500 transition-colors font-medium">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
