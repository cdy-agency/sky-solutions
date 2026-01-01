"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { intakeApi } from "@/lib/api"
import InvestorForm from "@/components/forms/investor-form"
import { Card } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function InvestorIntakePage() {
  const router = useRouter()
  const { token, user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (formData: Record<string, any>) => {
    if (!token) {
      setError("Not authenticated")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      await intakeApi.create(token, {
        form_type: "investor",
        ...formData,
      })
      router.push("/investor/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to save form")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        {error && (
          <Card className="mb-6 p-4 border-red-200 bg-red-50">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </Card>
        )}

        <InvestorForm onSubmit={handleSubmit} isLoading={isSubmitting} />
      </div>
    </DashboardLayout>
  )
}
