import React from "react"

interface CardProps {
  children: React.ReactNode
  className?: string
  highlighted?: boolean
  hoverable?: boolean
}

export function Card({ children, className = "", highlighted, hoverable = true }: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-2xl border transition-all duration-300
        ${highlighted
          ? "border-l-4 border-l-brand-500 border-[var(--color-border)]"
          : "border-[var(--color-border)]"
        }
        ${hoverable ? "shadow-card hover:shadow-card-hover" : "shadow-card"}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = "" }: CardProps) {
  return (
    <div className={`px-6 py-5 border-b border-[var(--color-border-light)] ${className}`}>
      {children}
    </div>
  )
}

export function CardContent({ children, className = "" }: CardProps) {
  return <div className={`px-6 py-5 ${className}`}>{children}</div>
}
