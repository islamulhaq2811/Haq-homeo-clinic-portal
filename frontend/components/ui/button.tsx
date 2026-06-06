import React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  loading?: boolean
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  loading,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"

  const variants: Record<string, string> = {
    primary:
      "bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-[0_1px_2px_rgba(5,150,105,0.3)] hover:from-brand-600 hover:to-brand-700 hover:shadow-[0_4px_12px_rgba(5,150,105,0.25)] active:from-brand-700 active:to-brand-800",
    secondary:
      "bg-white text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-border-light)] hover:border-[var(--color-border)] hover:text-[var(--color-text)] active:bg-[var(--color-border)]",
    outline:
      "bg-transparent text-brand-600 border border-brand-300 hover:bg-brand-50 hover:border-brand-400 active:bg-brand-100",
    ghost:
      "text-[var(--color-text-secondary)] hover:bg-[var(--color-border-light)] hover:text-[var(--color-text)]",
  }

  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-0.5" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity="0.3" />
          <path d="M14 8a6 6 0 0 1-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  )
}
