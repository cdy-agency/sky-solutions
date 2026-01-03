"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { intakeApi } from "@/lib/api"
import IdeationForm from "@/components/forms/ideation-form"
import ActiveBusinessForm from "@/components/forms/active-business-form"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function CreateIntakePage() {
  const router = useRouter()
  const params = useParams()
  const { token } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const formType = params.type as string

  if (!["ideation", "active_business"].includes(formType)) {
    return (
      <DashboardLayout>
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Invalid Form Type</h3>
              <p className="text-red-800 text-sm">Please select a valid form type</p>
              <Link href="/entrepreneur/intakes/select" className="mt-2 inline-block">
                <Button variant="outline" size="sm">Go to Selection Page</Button>
              </Link>
            </div>
          </div>
        </Card>
      </DashboardLayout>
    )
  }

  const handleSubmit = async (formData: Record<string, any>) => {
    if (!token) {
      setError("Not authenticated")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      await intakeApi.create(token, {
        form_type: formType,
        ...formData,
      })
      router.push("/entrepreneur/intakes")
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

        {formType === "ideation" && <IdeationForm onSubmit={handleSubmit} isLoading={isSubmitting} />}

        {formType === "active_business" && <ActiveBusinessForm onSubmit={handleSubmit} isLoading={isSubmitting} />}
      </div>
    </DashboardLayout>
  )
}
