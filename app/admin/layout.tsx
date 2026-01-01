"use client"

import type React from "react"
import { useRoleGuard } from "@/lib/use-role-guard"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useRoleGuard()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return <>{children}</>
}
