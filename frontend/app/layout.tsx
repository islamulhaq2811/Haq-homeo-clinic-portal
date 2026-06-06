import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Haq Homeo Clinic - AI-Powered Healthcare",
  description:
    "AI-Powered Appointment & Medical Report Management System for Dr. Halima Haq",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
