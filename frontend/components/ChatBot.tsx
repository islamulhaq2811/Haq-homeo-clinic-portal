"use client"

import React, { useState, useRef, useEffect } from "react"
import { api, ChatResponse } from "@/lib/api"
import { RobotIcon, UserIcon, SendIcon } from "@/components/Icons"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to Haq Homeo Clinic! I'm your AI care assistant. I can help you book appointments, check your records, upload reports, or answer questions. How can I help today?",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [patientId, setPatientId] = useState<number | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMsg }])
    setLoading(true)
    try {
      const data: ChatResponse = await api.ai.chat({
        patient_id: patientId ?? undefined,
        message: userMsg,
      })
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }])
      if (data.action_data && typeof data.action_data.patient_id === "number") {
        setPatientId(data.action_data.patient_id)
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again or call the clinic directly." },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[520px] sm:h-[580px] bg-white rounded-2xl border border-[var(--color-border)] shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--color-border-light)] bg-gradient-to-r from-brand-50/80 to-white flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-soft flex-shrink-0">
          <RobotIcon size={16} className="text-white" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-[var(--color-text)] text-sm">AI Care Assistant</h3>
          <p className="text-[11px] text-[var(--color-text-secondary)] truncate">Dr. Halima Haq</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse-subtle" />
          <span className="text-[10px] text-brand-600 font-medium">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scroll-smooth">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
            <div className={`flex gap-2.5 max-w-[85%] sm:max-w-[75%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                msg.role === "user" ? "bg-brand-100" : "bg-[var(--color-border-light)]"
              }`}>
                {msg.role === "user"
                  ? <UserIcon size={13} className="text-brand-600" />
                  : <RobotIcon size={13} className="text-[var(--color-text-secondary)]" />
                }
              </div>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-tr-md"
                  : "bg-[var(--color-border-light)] text-[var(--color-text)] rounded-tl-md"
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex gap-2.5 max-w-[85%]">
              <div className="w-7 h-7 rounded-full bg-[var(--color-border-light)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <RobotIcon size={13} className="text-[var(--color-text-secondary)]" />
              </div>
              <div className="bg-[var(--color-border-light)] rounded-2xl rounded-tl-md px-4 py-3 border border-[var(--color-border-light)]">
                <span className="inline-flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[var(--color-border-light)] bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-sm
                       placeholder:text-[var(--color-text-tertiary)] text-[var(--color-text)]
                       transition-all duration-200
                       focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="btn-primary px-4"
          >
            <SendIcon size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
