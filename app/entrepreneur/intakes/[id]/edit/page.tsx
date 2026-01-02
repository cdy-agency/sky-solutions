"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { intakeApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import IdeationForm from "@/components/forms/ideation-form"
import ActiveBusinessForm from "@/components/forms/active-business-form"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"

interface IntakeSubmission {
  _id: string
  form_type: "ideation" | "active_business" | "investor"
  status: "pending" | "submitted" | "under_review" | "approved" | "rejected"
  [key: string]: any
}

export default function EditIntakePage() {
  const { id } = useParams()
  const router = useRouter()
  const { token } = useAuth()
  const { toast } = useToast()
  const [intake, setIntake] = useState<IntakeSubmission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchIntake = async () => {
      if (!token || !id) return
      try {
        const data = await intakeApi.getById(id as string, token)
        setIntake(data)
      } catch (error: any) {
        toast({ title: "Error", description: error.message || "Failed to load intake form", variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    }
    fetchIntake()
  }, [token, id, toast])

  const handleSubmit = async (formData: Record<string, any>) => {
    if (!token || !id) return
    setIsSaving(true)
    try {
      await intakeApi.update(id as string, token, formData)
      toast({ title: "Success", description: "Intake form updated successfully" })
      router.push(`/entrepreneur/intakes/${id}`)
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update form", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-8 w-32 animate-pulse bg-muted rounded" />
          <div className="h-64 animate-pulse bg-muted rounded" />
        </div>
      </DashboardLayout>
    )
  }

  if (!intake) {
    return (
      <DashboardLayout>
        <Card>
          <div className="p-12 text-center">
            <p className="text-muted-foreground mb-4">Intake form not found</p>
            <Link href="/entrepreneur/intakes">
              <Button variant="outline">Back to Intakes</Button>
            </Link>
          </div>
        </Card>
      </DashboardLayout>
    )
  }

  if (intake.status === "approved" || intake.status === "rejected") {
    return (
      <DashboardLayout>
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Cannot Edit</h3>
              <p className="text-red-800 text-sm">
                This intake form has been {intake.status}. You cannot edit it. Please create a new submission if needed.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link href={`/entrepreneur/intakes/${id}`}>
              <Button variant="outline">Back to View</Button>
            </Link>
          </div>
        </Card>
      </DashboardLayout>
    )
  }

  // Convert intake data to form format
  const initialFormData = {
    ...intake,
    // Ensure arrays are properly formatted
    marketing_channels: Array.isArray(intake.marketing_channels) ? intake.marketing_channels : [],
    investor_type_seeking: Array.isArray(intake.investor_type_seeking) ? intake.investor_type_seeking : [],
    support_needed: Array.isArray(intake.support_needed) ? intake.support_needed : [],
    competitors: Array.isArray(intake.competitors) ? intake.competitors : [],
    // Ensure objects are properly formatted
    current_employment: intake.current_employment || { position: "", company: "", start_date: "", salary: "" },
    previous_employment: Array.isArray(intake.previous_employment) ? intake.previous_employment : [],
    education: intake.education || { degree: "", institution: "", year: "", field: "" },
    fund_allocation: intake.fund_allocation || { marketing: "", operations: "", product_dev: "", salaries: "", other: "" },
    team_members: Array.isArray(intake.team_members) ? intake.team_members : [],
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Edit {intake.form_type === "ideation" ? "Ideation Stage" : "Active Business"} Intake Form
            </h1>
            <p className="text-muted-foreground">Update your intake form information</p>
          </div>
        </div>

        {intake.form_type === "ideation" ? (
          <IdeationForm onSubmit={handleSubmit} isLoading={isSaving} initialData={initialFormData} />
        ) : intake.form_type === "active_business" ? (
          <ActiveBusinessForm onSubmit={handleSubmit} isLoading={isSaving} initialData={initialFormData} />
        ) : (
          <Card className="p-6">
            <p className="text-muted-foreground">Form type not supported for editing</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}


