"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ChatIcon, RobotIcon, UserIcon } from "@/components/Icons"
import { authApi } from "@/lib/auth"

export default function AdminChatLogs() {
  const [messages, setMessages] = useState<Array<{
    id: number; role: string; content: string; intent: string | null; created_at: string
  }>>([])
  const [patients, setPatients] = useState<Array<{ id: number; name: string; phone: string }>>([])
  const [selectedPatient, setSelectedPatient] = useState<number | undefined>(undefined)

  useEffect(() => {
    authApi.patients.list().then(setPatients)
    authApi.messages().then(setMessages)
  }, [])

  const loadMessages = (patientId?: number) => {
    setSelectedPatient(patientId)
    authApi.messages(patientId).then(setMessages)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--color-text)]">Chat Logs</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">Review AI assistant conversations</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Patient List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <ChatIcon size={16} className="text-brand-600" />
              <h3 className="font-semibold text-[var(--color-text)]">Patients</h3>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <button
              onClick={() => loadMessages(undefined)}
              className={`w-full text-left px-4 py-3 text-sm border-b border-[var(--color-border-light)] transition-colors ${
                !selectedPatient
                  ? "bg-brand-50 text-brand-700 font-semibold"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-border-light)]"
              }`}
            >
              All Messages
            </button>
            {patients.map((p) => (
              <button
                key={p.id}
                onClick={() => loadMessages(p.id)}
                className={`w-full text-left px-4 py-3 text-sm border-b border-[var(--color-border-light)] transition-colors ${
                  selectedPatient === p.id
                    ? "bg-brand-50 text-brand-700 font-semibold"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-border-light)]"
                }`}
              >
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-[var(--color-text-tertiary)]">{p.phone}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <h3 className="font-semibold text-[var(--color-text)]">Conversation History</h3>
          </CardHeader>
          <CardContent className="max-h-[600px] overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <ChatIcon size={36} className="mx-auto mb-3 text-[var(--color-text-tertiary)]" />
                <p className="text-sm text-[var(--color-text-secondary)]">No messages yet</p>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
                  <div className={`flex gap-2.5 max-w-[80%] ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      m.role === "user" ? "bg-brand-100" : "bg-[var(--color-border-light)]"
                    }`}>
                      {m.role === "user"
                        ? <UserIcon size={13} className="text-brand-600" />
                        : <RobotIcon size={13} className="text-[var(--color-text-secondary)]" />
                      }
                    </div>
                    <div className={`rounded-2xl px-4 py-3 text-sm ${
                      m.role === "user"
                        ? "bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-tr-md"
                        : "bg-[var(--color-border-light)] text-[var(--color-text)] rounded-tl-md"
                    }`}>
                      <p className="leading-relaxed">{m.content}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[10px] ${m.role === "user" ? "text-white/60" : "text-[var(--color-text-tertiary)]"}`}>
                          {new Date(m.created_at).toLocaleTimeString()}
                        </span>
                        {m.intent && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            m.role === "user"
                              ? "bg-white/20 text-white/80"
                              : "bg-white/80 text-[var(--color-text-secondary)]"
                          }`}>
                            {m.intent}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
