"use client"

import { useState } from "react"
import Link from "next/link"
import ChatBot from "@/components/ChatBot"
import QuickUpload from "@/components/QuickUpload"
import { CalendarIcon, FileTextIcon, ActivityIcon, RobotIcon } from "@/components/Icons"

const features = [
  {
    icon: CalendarIcon,
    title: "Smart Scheduling",
    desc: "AI-powered appointments that check Dr. Halima Haq's availability and book instantly.",
    gradient: "from-brand-500 to-emerald-500",
  },
  {
    icon: FileTextIcon,
    title: "Report Analysis",
    desc: "Upload medical reports and receive AI summaries, key findings, and plain-language explanations.",
    gradient: "from-amber-400 to-orange-400",
  },
  {
    icon: ActivityIcon,
    title: "Follow-up Care",
    desc: "Automated reminders and organized records for seamless follow-up care coordination.",
    gradient: "from-violet-500 to-purple-500",
  },
]

export default function Home() {
  const [showUpload, setShowUpload] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[var(--color-border-light)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-soft transition-transform duration-300 group-hover:scale-105 flex-shrink-0">
                <img src="/logo.jpeg" alt="Haq Homeo Clinic" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-bold text-[var(--color-text)] text-base sm:text-lg">Haq Homeo Clinic</p>
                <p className="text-[11px] sm:text-xs text-[var(--color-text-secondary)] -mt-0.5">Dr. Halima Haq</p>
              </div>
            </Link>
            <nav className="flex items-center gap-1">
              <Link href="/dashboard" className="btn-ghost text-sm">Dashboard</Link>
              <Link href="/appointments" className="btn-ghost text-sm">Appointments</Link>
              <Link href="/reports" className="btn-ghost text-sm">Reports</Link>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-dot-pattern opacity-50" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-brand-500/5 to-transparent opacity-70" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-8 animate-fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse-subtle" />
                AI-Powered Healthcare
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--color-text)] tracking-tight mb-6 animate-fade-in leading-[1.1]">
                Modern Healing,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400">
                  Thoughtfully Guided
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-xl mx-auto mb-10 leading-relaxed animate-fade-in-up">
                Dr. Halima Haq combines homeopathic expertise with AI-powered tools 
                to deliver seamless, personalized care for every patient.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up">
                <a href="#chat" className="btn-primary text-base px-7 py-3">
                  <RobotIcon size={18} />
                  Talk to AI Assistant
                </a>
                <button
                  onClick={() => setShowUpload(!showUpload)}
                  className="btn-secondary text-base px-7 py-3"
                >
                  Upload a Report
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Upload */}
        {showUpload && (
          <section className="max-w-lg mx-auto px-4 mb-24 animate-slide-up">
            <QuickUpload onClose={() => setShowUpload(false)} />
          </section>
        )}

        {/* Features */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="text-center mb-14">
            <h2 className="section-heading text-2xl sm:text-3xl mb-3">Everything you need for better care</h2>
            <p className="text-[var(--color-text-secondary)] max-w-lg mx-auto">
              Intelligent tools designed to make your healthcare experience smooth and stress-free.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="group relative bg-white rounded-2xl border border-[var(--color-border)] p-8 
                             shadow-card hover:shadow-card-hover transition-all duration-500"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} 
                                flex items-center justify-center mb-5
                                group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                  >
                    <Icon size={22} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">{feature.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Divider */}
        <div className="max-w-xl mx-auto px-4 mb-16">
          <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />
        </div>

        {/* Chat Section */}
        <section id="chat" className="max-w-2xl mx-auto px-4 pb-24">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-semibold mb-4">
              <RobotIcon size={12} />
              AI Assistant
            </div>
            <h2 className="section-heading text-2xl mb-2">Chat with your care assistant</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Describe your symptoms, book appointments, or ask questions.
            </p>
          </div>
          <ChatBot />
          <p className="text-xs text-[var(--color-text-tertiary)] text-center mt-5 max-w-lg mx-auto leading-relaxed">
            This AI does not diagnose diseases or prescribe medicines. It only assists with appointment handling and report summarization.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border-light)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <img src="/logo.jpeg" alt="Haq Homeo Clinic" className="w-full h-full object-cover" />
              </div>
              <p className="text-sm font-semibold text-[var(--color-text)]">Haq Homeo Clinic</p>
            </div>
            <p className="text-sm text-[var(--color-text-tertiary)]">
              &copy; {new Date().getFullYear()} Dr. Halima Haq
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
