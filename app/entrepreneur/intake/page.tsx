"use client"

import { useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { entrepreneurApi } from "@/lib/api"
import { Plus, FileText, Clock, CheckCircle, XCircle } from "lucide-react"
import { useEffect } from "react"

interface IntakeForm {
  _id: string
  form_type: string
  business_name?: string
  full_name: string
  status: string
  created_at: string
  updated_at: string
}

export default function IntakeForms() {
  const { token, user } = useAuth()
  const [forms, setForms] = useState<IntakeForm[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchForms = async () => {
      if (!token) return
      try {
        const data = await entrepreneurApi.getIntakeForms(token)
        setForms(data)
      } catch (error) {
        console.error("Failed to fetch forms:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchForms()
  }, [token])

  const formTypes = {
    ideation: "Ideation Stage",
    active_business: "Active Business",
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "submitted":
        return <FileText className="h-4 w-4 text-blue-600" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "submitted":
        return "bg-blue-100 text-blue-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Intake Forms</h1>
            <p className="text-muted-foreground">Manage your business intake submissions</p>
          </div>
          <div className="flex gap-2">
            <Link href="/entrepreneur/intake/ideation">
              <Button variant="outline">New Ideation Form</Button>
            </Link>
            <Link href="/entrepreneur/intake/active-business">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Active Business Form
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Forms</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse bg-muted rounded" />
                ))}
              </div>
            ) : forms.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No forms submitted yet</p>
                <div className="flex justify-center gap-2">
                  <Link href="/entrepreneur/intake/ideation">
                    <Button variant="outline">Create Ideation Form</Button>
                  </Link>
                  <Link href="/entrepreneur/intake/active-business">
                    <Button>Create Active Business Form</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {forms.map((form) => (
                  <Link key={form._id} href={`/entrepreneur/intake/${form._id}`}>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">
                          {formTypes[form.form_type as keyof typeof formTypes] || form.form_type}
                        </h3>
                        <p className="text-sm text-muted-foreground">{form.full_name}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {new Date(form.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(form.status)}
                          <Badge className={getStatusColor(form.status)}>{form.status}</Badge>
                        </div>
                      </div>
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
