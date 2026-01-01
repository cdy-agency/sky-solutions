"use client"

import { useEffect, useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { adminApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { FileText, CheckCircle, XCircle, Clock, Search, Loader2, Eye } from "lucide-react"
import Link from "next/link"

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
}

export default function AdminIntakesPage() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [intakes, setIntakes] = useState<IntakeSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [selectedIntake, setSelectedIntake] = useState<IntakeSubmission | null>(null)
  const [approvalDialog, setApprovalDialog] = useState(false)
  const [rejectionDialog, setRejectionDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchIntakes()
  }, [token, filter])

  const fetchIntakes = async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const params: any = {}
      if (filter !== "all") {
        params.status = filter
      }
      const data = await adminApi.getIntakes(token, params)
      setIntakes(data.intakes || data || [])
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to fetch intakes", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!token || !selectedIntake) return
    setIsProcessing(true)
    try {
      await adminApi.updateIntakeStatus(selectedIntake._id, { status: "approved" }, token)
      toast({ title: "Success", description: "Intake form approved successfully" })
      setApprovalDialog(false)
      setSelectedIntake(null)
      fetchIntakes()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to approve intake", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!token || !selectedIntake || !rejectionReason.trim()) {
      toast({ title: "Error", description: "Please provide a rejection reason", variant: "destructive" })
      return
    }
    setIsProcessing(true)
    try {
      await adminApi.updateIntakeStatus(selectedIntake._id, { status: "rejected", rejection_reason: rejectionReason }, token)
      toast({ title: "Success", description: "Intake form rejected" })
      setRejectionDialog(false)
      setSelectedIntake(null)
      setRejectionReason("")
      fetchIntakes()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to reject intake", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "submitted":
      case "under_review":
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

  const filteredIntakes = intakes.filter((intake) => {
    if (search) {
      const searchLower = search.toLowerCase()
      return (
        intake.full_name.toLowerCase().includes(searchLower) ||
        intake.email.toLowerCase().includes(searchLower) ||
        (intake.business_name && intake.business_name.toLowerCase().includes(searchLower)) ||
        intake.user_id.name.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Intake Submissions</h1>
          <p className="text-muted-foreground">Review and manage user intake forms</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or business..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Intakes List */}
        <Card>
          <CardHeader>
            <CardTitle>Intake Forms ({filteredIntakes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse bg-muted rounded" />
                ))}
              </div>
            ) : filteredIntakes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No intake forms found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredIntakes.map((intake) => (
                  <div
                    key={intake._id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {getStatusIcon(intake.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground">{intake.full_name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {intake.user_id.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{intake.email}</p>
                        {intake.business_name && (
                          <p className="text-sm text-muted-foreground">Business: {intake.business_name}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {intake.form_type === "ideation" ? "Ideation Stage" : intake.form_type === "active_business" ? "Active Business" : "Investor"} • Created{" "}
                          {new Date(intake.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusBadge(intake.status)}>{intake.status.replace("_", " ")}</Badge>
                      <Link href={`/admin/intakes/${intake._id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      {intake.status === "submitted" && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              setSelectedIntake(intake)
                              setApprovalDialog(true)
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedIntake(intake)
                              setRejectionDialog(true)
                            }}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            {selectedIntake && (
              <div className="py-4">
                <p className="text-sm text-muted-foreground">
                  <strong>User:</strong> {selectedIntake.user_id.name} ({selectedIntake.user_id.email})
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Form Type:</strong> {selectedIntake.form_type.replace("_", " ")}
                </p>
              </div>
            )}
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

