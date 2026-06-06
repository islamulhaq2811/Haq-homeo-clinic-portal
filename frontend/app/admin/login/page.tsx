"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { authApi, setToken } from "@/lib/auth"
import { RobotIcon } from "@/components/Icons"

export default function AdminLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await authApi.login(username, password)
      setToken(res.token)
      router.push("/admin")
    } catch {
      setError("Invalid username or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-5 shadow-warm">
            <img src="/logo.jpeg" alt="Haq Homeo Clinic" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Welcome back</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Sign in to your admin account</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl border border-[var(--color-border)] shadow-card p-6 space-y-5">
          <div>
            <label className="input-label">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="admin"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="input-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <div className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2 border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-xs text-[var(--color-text-tertiary)] text-center">
            Default: <span className="font-medium text-[var(--color-text-secondary)]">admin</span> / <span className="font-medium text-[var(--color-text-secondary)]">admin123</span>
          </p>
        </form>
      </div>
    </div>
  )
}
