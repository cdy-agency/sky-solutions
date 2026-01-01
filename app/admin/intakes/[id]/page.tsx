"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { adminApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, Loader2 } from "lucide-react"

interface IntakeSubmission {
  _id: string
  user_id: {
    _id: string
    name: string
    email: string
    phone?: string
    role: string
  }
  form_type: "ideation" | "active_business" | "investor"
  full_name: string
  email: string
  phone: string
  country: string
  status: "pending" | "submitted" | "under_review" | "approved" | "rejected"
  rejection_reason?: string
  business_name?: string
  created_at: string
  updated_at: string
  [key: string]: any
}

export default function AdminIntakeDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { token } = useAuth()
  const { toast } = useToast()
  const [intake, setIntake] = useState<IntakeSubmission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [approvalDialog, setApprovalDialog] = useState(false)
  const [rejectionDialog, setRejectionDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const fetchIntake = async () => {
      if (!token || !id) return
      try {
        const data = await adminApi.getIntakeById(id as string, token)
        setIntake(data)
      } catch (error: any) {
        toast({ title: "Error", description: error.message || "Failed to load intake form", variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    }
    fetchIntake()
  }, [token, id, toast])

  const handleApprove = async () => {
    if (!token || !id) return
    setIsProcessing(true)
    try {
      await adminApi.updateIntakeStatus(id as string, { status: "approved" }, token)
      toast({ title: "Success", description: "Intake form approved successfully" })
      setApprovalDialog(false)
      router.push("/admin/intakes")
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to approve intake", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!token || !id || !rejectionReason.trim()) {
      toast({ title: "Error", description: "Please provide a rejection reason", variant: "destructive" })
      return
    }
    setIsProcessing(true)
    try {
      await adminApi.updateIntakeStatus(id as string, { status: "rejected", rejection_reason: rejectionReason }, token)
      toast({ title: "Success", description: "Intake form rejected" })
      setRejectionDialog(false)
      setRejectionReason("")
      router.push("/admin/intakes")
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to reject intake", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "submitted":
      case "under_review":
        return <Clock className="h-5 w-5 text-blue-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-600" />
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
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">Intake form not found</p>
            <Link href="/admin/intakes">
              <Button variant="outline">Back to Intakes</Button>
            </Link>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Intake Form Details</h1>
              <p className="text-muted-foreground">Review intake submission</p>
            </div>
          </div>
          {intake.status === "submitted" && (
            <div className="flex gap-2">
              <Button
                onClick={() => setApprovalDialog(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button variant="destructive" onClick={() => setRejectionDialog(true)}>
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Status</CardTitle>
              <div className="flex items-center gap-2">
                {getStatusIcon(intake.status)}
                <Badge className={getStatusBadge(intake.status)}>{intake.status.replace("_", " ")}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {intake.status === "rejected" && intake.rejection_reason && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
                <p className="text-sm text-red-700">{intake.rejection_reason}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{intake.user_id.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{intake.user_id.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{intake.user_id.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <Badge variant="outline">{intake.user_id.role}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Details */}
        <Card>
          <CardHeader>
            <CardTitle>Form Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Form Type</p>
                <p className="font-medium capitalize">{intake.form_type.replace("_", " ")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{intake.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{intake.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{intake.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Country</p>
                <p className="font-medium">{intake.country}</p>
              </div>
              {intake.business_name && (
                <div>
                  <p className="text-sm text-muted-foreground">Business Name</p>
                  <p className="font-medium">{intake.business_name}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{new Date(intake.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">{new Date(intake.updated_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Display all other fields */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-4">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(intake)
                  .filter(
                    ([key]) =>
                      ![
                        "_id",
                        "user_id",
                        "form_type",
                        "full_name",
                        "email",
                        "phone",
                        "country",
                        "business_name",
                        "status",
                        "rejection_reason",
                        "created_at",
                        "updated_at",
                        "__v",
                      ].includes(key),
                  )
                  .map(([key, value]) => {
                    if (!value || (typeof value === "object" && Object.keys(value).length === 0)) return null
                    
                    // Handle arrays
                    if (Array.isArray(value)) {
                      return (
                        <div key={key} className="md:col-span-2">
                          <p className="text-sm text-muted-foreground capitalize mb-2">{key.replace(/_/g, " ")}</p>
                          <div className="flex flex-wrap gap-2">
                            {value.map((item, idx) => (
                              <Badge key={idx} variant="outline" className="text-sm">
                                {typeof item === "object" ? JSON.stringify(item) : String(item)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )
                    }
                    
                    // Handle nested objects
                    if (typeof value === "object" && value !== null && !(value instanceof Date)) {
                      return (
                        <div key={key} className="md:col-span-2">
                          <p className="text-sm text-muted-foreground capitalize mb-2">{key.replace(/_/g, " ")}</p>
                          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                            {Object.entries(value).map(([nestedKey, nestedValue]) => (
                              <div key={nestedKey} className="flex justify-between">
                                <span className="text-sm text-muted-foreground capitalize">{nestedKey.replace(/_/g, " ")}:</span>
                                <span className="text-sm font-medium break-words">{String(nestedValue || "N/A")}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    }
                    
                    // Handle simple values
                    return (
                      <div key={key}>
                        <p className="text-sm text-muted-foreground capitalize">{key.replace(/_/g, " ")}</p>
                        <p className="font-medium break-words">{String(value)}</p>
                      </div>
                    )
                  })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approval Dialog */}
        <Dialog open={approvalDialog} onOpenChange={setApprovalDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Intake Form</DialogTitle>
              <DialogDescription>
                Are you sure you want to approve this intake form? The user will be notified and can access all platform features.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApprovalDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleApprove} disabled={isProcessing} className="bg-green-600 hover:bg-green-700">
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rejection Dialog */}
        <Dialog open={rejectionDialog} onOpenChange={setRejectionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Intake Form</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this intake form. The user will be notified.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Enter the reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleReject} disabled={isProcessing || !rejectionReason.trim()} variant="destructive">
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

