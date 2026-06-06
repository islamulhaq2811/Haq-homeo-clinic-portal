"use client"

import React, { useEffect, useState } from "react"
import { authApi } from "@/lib/auth"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { UsersIcon, PhoneIcon, SearchIcon } from "@/components/Icons"

export default function AdminPatients() {
  const [patients, setPatients] = useState<Array<{
    id: number; name: string; age: number | null; gender: string | null; phone: string; created_at: string
  }>>([])
  const [search, setSearch] = useState("")

  useEffect(() => { authApi.patients.list().then(setPatients) }, [])

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search),
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--color-text)]">Patients</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">Manage your patient records</p>
      </div>

      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="relative max-w-sm">
            <SearchIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-10 text-center">
              <UsersIcon size={36} className="mx-auto mb-3 text-[var(--color-text-tertiary)]" />
              <p className="text-sm text-[var(--color-text-secondary)]">
                {search ? "No patients match your search" : "No patients found"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border-light)]">
              {filtered.map((p) => (
                <div key={p.id} className="px-6 py-4 flex items-center justify-between hover:bg-[var(--color-border-light)]/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center">
                      <UsersIcon size={16} className="text-brand-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text)]">{p.name}</p>
                      <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)]">
                        <span className="flex items-center gap-1"><PhoneIcon size={10} />{p.phone}</span>
                        {p.age && <span>{p.age} yrs</span>}
                        {p.gender && <span>{p.gender}</span>}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-[var(--color-text-tertiary)]">{new Date(p.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
