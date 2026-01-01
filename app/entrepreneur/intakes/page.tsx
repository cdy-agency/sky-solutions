"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { intakeApi } from "@/lib/api"
import { Plus, FileText, Clock, CheckCircle, XCircle } from "lucide-react"

interface Intake {
  _id: string
  form_type: "ideation" | "active_business" | "investor"
  business_name?: string
  full_name: string
  status: "pending" | "submitted" | "under_review" | "approved" | "rejected"
  created_at: string
  updated_at?: string
}

export default function IntakesPage() {
  const { token } = useAuth()
  const [intakes, setIntakes] = useState<Intake[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchIntakes = async () => {
      if (!token) return
      try {
        const data = await intakeApi.getAll(token)
        setIntakes(data)
      } catch (error) {
        console.error("Failed to fetch intakes:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchIntakes()
  }, [token])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "submitted":
        return <Clock className="h-4 w-4 text-blue-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: "bg-gray-100 text-gray-800",
      submitted: "bg-blue-100 text-blue-800",
      under_review: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    }
    return variants[status] || "bg-gray-100 text-gray-800"
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Intake Forms</h1>
            <p className="text-muted-foreground">Manage your business intake submissions</p>
          </div>
          <Link href="/entrepreneur/intakes/select">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Intake Form
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Intake Forms</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse bg-muted rounded" />
                ))}
              </div>
            ) : intakes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't created any intake forms yet</p>
                <Link href="/entrepreneur/intakes/select">
                  <Button>Create Your First Intake Form</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {intakes.map((intake) => (
                  <Link key={intake._id} href={`/entrepreneur/intakes/${intake._id}`}>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(intake.status)}
                        <div>
                          <h3 className="font-medium text-foreground">
                            {intake.form_type === "ideation" ? "Ideation Stage" : "Active Business"} Form
                          </h3>
                          {intake.business_name && (
                            <p className="text-sm text-muted-foreground">{intake.business_name}</p>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusBadge(intake.status)}>{intake.status.replace("_", " ")}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
