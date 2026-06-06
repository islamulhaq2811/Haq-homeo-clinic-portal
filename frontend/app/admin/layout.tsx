"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { isAuthenticated, clearToken, authApi } from "@/lib/auth"
import {
  HomeIcon, CalendarIcon, UsersIcon, FileTextIcon, ChatIcon, XIcon, MenuIcon,
} from "@/components/Icons"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: HomeIcon },
  { href: "/admin/patients", label: "Patients", icon: UsersIcon },
  { href: "/admin/chat-logs", label: "Chat Logs", icon: ChatIcon },
  { href: "/appointments", label: "Appointments", icon: CalendarIcon },
  { href: "/reports", label: "Reports", icon: FileTextIcon },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [authed, setAuthed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [staff, setStaff] = useState<{ full_name?: string } | null>(null)

  useEffect(() => {
    if (pathname === "/admin/login") return
    if (!isAuthenticated()) {
      router.push("/admin/login")
      return
    }
    setAuthed(true)
    authApi.me().then(setStaff).catch(() => {
      clearToken()
      router.push("/admin/login")
    })
  }, [pathname, router])

  if (pathname === "/admin/login") return <>{children}</>
  if (!authed) return null

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-[var(--color-border)]
        transform transition-transform duration-300 ease-out
        lg:translate-x-0 lg:static lg:inset-auto
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="px-5 py-5 border-b border-[var(--color-border-light)]">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 shadow-soft transition-transform duration-300 group-hover:scale-105">
                <img src="/logo.jpeg" alt="Haq Homeo Clinic" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-bold text-[var(--color-text)]">Haq Homeo Clinic</p>
                <p className="text-[11px] text-[var(--color-text-secondary)] -mt-0.5">Admin Panel</p>
              </div>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                    active
                      ? "bg-brand-50 text-brand-700 font-semibold"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-border-light)] hover:text-[var(--color-text)]"
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User */}
          <div className="p-4 border-t border-[var(--color-border-light)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center">
                  <UsersIcon size={13} className="text-brand-600" />
                </div>
                <span className="text-sm text-[var(--color-text-secondary)]">{staff?.full_name || "Admin"}</span>
              </div>
              <button
                onClick={() => { clearToken(); router.push("/admin/login") }}
                className="text-xs text-[var(--color-text-tertiary)] hover:text-red-500 font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-20 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white/80 backdrop-blur-xl border-b border-[var(--color-border-light)] px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors">
            <MenuIcon size={20} />
          </button>
          <p className="text-sm font-semibold text-[var(--color-text)]">Haq Homeo Admin</p>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
