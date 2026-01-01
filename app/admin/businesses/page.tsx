"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { adminApi, apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Eye, Plus, Upload, X } from "lucide-react"

interface Business {
  _id: string
  title: string
  category_id?: { _id: string; name: string; registration_fee?: number } | string
  status: "pending" | "approved" | "rejected" | "draft" | "in_review" | "active"
  entrepreneur_id?: { name: string; email: string; phone?: string }
  business_plan_url?: string
  created_at: string
}

interface PublicBusiness {
  _id: string
  title: string
  category_id?: { _id: string; name: string } | string
  description: string
  remaining_shares?: number
  share_value?: number
  total_shares?: number
  equity_percentage?: number
  image_url?: string
  pdf_url?: string
  submission_id?: string
}

interface Category {
  _id: string
  name: string
  fee: number
}

export default function AdminBusinessesPage() {
  const { token } = useAuth()
  const { toast } = useToast()

  // Submissions state
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>("pending")
  const [approvalDialog, setApprovalDialog] = useState<{
    open: boolean
    business: Business | null
    action: "choose" | "approve" | "reject" | null
  }>({ open: false, business: null, action: null })
  const [rejectReason, setRejectReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [approvalFormData, setApprovalFormData] = useState({
    description: "",
    total_shares: "",
    share_value: "",
    minimum_shares_per_request: "1",
    equity_percentage: "",
  })
  const [approvalImage, setApprovalImage] = useState<File | null>(null)
  const [approvalPdf, setApprovalPdf] = useState<File | null>(null)

  // Public business creation state
  const [publicBusinesses, setPublicBusinesses] = useState<PublicBusiness[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [createPublicDialog, setCreatePublicDialog] = useState(false)
  const [publicFormData, setPublicFormData] = useState({
    title: "",
    category: "",
    description: "",
    total_shares: "",
    share_value: "",
  })
  const [publicImage, setPublicImage] = useState<File | null>(null)
  const [isCreatingPublic, setIsCreatingPublic] = useState(false)
  const [isLoadingPublic, setIsLoadingPublic] = useState(false)

  // Fetch submissions
  const fetchBusinesses = async () => {
    if (!token) return
    try {
      const params = filter !== "all" ? { status: filter } : undefined
      const data = await adminApi.getBusinesses(token, params)
      // @ts-ignore
      setBusinesses(data.businesses || data || [])
    } catch (error) {
      console.error("Failed to fetch businesses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch public businesses and categories
  useEffect(() => {
    const fetchPublicData = async () => {
      if (!token) return
      setIsLoadingPublic(true)
      try {
        const [publicData, catData] = await Promise.all([
          adminApi.getPublicBusinesses(token),
          adminApi.getCategories(token),
        ])
        setPublicBusinesses(publicData.businesses || publicData || [])
        setCategories(catData || [])
      } catch (error) {
        console.error("Failed to fetch public businesses:", error)
      } finally {
        setIsLoadingPublic(false)
      }
    }
    fetchPublicData()
  }, [token])

  useEffect(() => {
    fetchBusinesses()
  }, [token, filter])

  const handleApprove = async () => {
    if (!token || !approvalDialog.business) return

    // Validate required fields
    if (!approvalFormData.description || !approvalFormData.total_shares || !approvalFormData.share_value) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (description, total shares, share value)",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("description", approvalFormData.description)
      formData.append("total_shares", approvalFormData.total_shares)
      formData.append("share_value", approvalFormData.share_value)
      if (approvalFormData.minimum_shares_per_request) {
        formData.append("minimum_shares_per_request", approvalFormData.minimum_shares_per_request)
      }
      if (approvalFormData.equity_percentage) {
        formData.append("equity_percentage", approvalFormData.equity_percentage)
      }
      // needed_funds is calculated automatically: total_shares * share_value
      if (approvalImage) {
        formData.append("image", approvalImage)
      }
      if (approvalPdf) {
        formData.append("pdf", approvalPdf)
      }

      await adminApi.approveBusiness(approvalDialog.business._id, formData, token)
      toast({ title: "Success", description: "Business approved successfully" })
      setApprovalDialog({ open: false, business: null, action: null })
      setApprovalFormData({
        description: "",
        total_shares: "",
        share_value: "",
        minimum_shares_per_request: "1",
        equity_percentage: "",
      })
      setApprovalImage(null)
      setApprovalPdf(null)
      fetchBusinesses()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!token || !approvalDialog.business || !rejectReason) {
      toast({ title: "Error", description: "Please provide a rejection reason", variant: "destructive" })
      return
    }
    setIsSubmitting(true)
    try {
      await adminApi.rejectBusiness(approvalDialog.business._id, rejectReason, token)
      toast({ title: "Success", description: "Business rejected successfully" })
      setApprovalDialog({ open: false, business: null, action: null })
      setRejectReason("")
      fetchBusinesses()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreatePublicBusiness = async () => {
    if (!token) return

    if (
      !publicFormData.title ||
      !publicFormData.category ||
      !publicFormData.description ||
      !publicFormData.total_shares ||
      !publicFormData.share_value ||
      !publicImage
    ) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" })
      return
    }

    setIsCreatingPublic(true)
    try {
      const formData = new FormData()
      formData.append("title", publicFormData.title)
      formData.append("category_id", publicFormData.category)
      formData.append("description", publicFormData.description)
      formData.append("total_shares", publicFormData.total_shares)
      formData.append("share_value", publicFormData.share_value)
      formData.append("image", publicImage)
      // needed_funds will be calculated automatically: total_shares * share_value

      await adminApi.createPublicBusiness(formData, token)
      toast({ title: "Success", description: "Public business listing created successfully" })
      setCreatePublicDialog(false)
      setPublicFormData({ title: "", category: "", description: "", total_shares: "", share_value: "" })
      setPublicImage(null)

      // Refresh public businesses
      const publicData = await adminApi.getPublicBusinesses(token)
      setPublicBusinesses(publicData.businesses || publicData || [])
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsCreatingPublic(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "Error",
          description: `File size exceeds 2MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`,
          variant: "destructive",
        })
        return
      }

      if (!file.type.startsWith("image/")) {
        toast({ title: "Error", description: "Please upload an image file", variant: "destructive" })
        return
      }
      setPublicImage(file)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
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
      <Tabs defaultValue="submissions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="submissions">Business Submissions</TabsTrigger>
          <TabsTrigger value="public">Public Listings</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Business Submissions</h1>
              <p className="text-muted-foreground">Review and approve entrepreneur submissions</p>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="h-24 animate-pulse bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : businesses.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No businesses found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {businesses.length > 0 && businesses.map((business) => (
                <Card key={business._id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground text-lg">{business.title}</h3>
                          <Badge className={getStatusColor(business.status)}>{business.status}</Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                         
                          <p>
                            Submitted by: {business.entrepreneur_id?.name} ({business.entrepreneur_id?.email})
                          </p>
                          <p>Submitted: {new Date(business.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {business.business_plan_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={business.business_plan_url} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4 mr-1" />
                              View Plan
                            </a>
                          </Button>
                        )}
                        {business.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => setApprovalDialog({ open: true, business, action: "choose" })}
                          >
                            Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="public" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Public Business Listings</h1>
              <p className="text-muted-foreground">Create and manage public business opportunities</p>
            </div>
            <Button onClick={() => setCreatePublicDialog(true)} className="bg-[#1B4F91]">
              <Plus className="h-4 w-4 mr-2" />
              Create Listing
            </Button>
          </div>

          {isLoadingPublic ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-0">
                    <div className="h-48 animate-pulse bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : publicBusinesses.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No public listings yet</p>
                <Button onClick={() => setCreatePublicDialog(true)}>Create First Listing</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {publicBusinesses.map((business) => (
                <Card key={business._id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="h-40 bg-muted flex items-center justify-center">
                      {business.image_url ? (
                        <img
                          src={business.image_url || "/placeholder.svg"}
                          alt={business.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl font-bold text-muted-foreground/30">{business.title.charAt(0)}</span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground line-clamp-1 mb-1">{business.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {typeof business.category_id === "object" && business.category_id
                          ? business.category_id.name
                          : business.category_id || "N/A"}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{business.description}</p>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-[#1B4F91]">
                          {business.remaining_shares || 0} shares available
                        </p>
                        {business.remaining_shares && business.share_value && (
                          <p className="text-xs text-muted-foreground">
                            ${(business.remaining_shares * business.share_value).toLocaleString()} needed
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      <Dialog
        open={approvalDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setApprovalDialog({ open: false, business: null, action: null })
            setApprovalFormData({
              description: "",
              total_shares: "",
              share_value: "",
              minimum_shares_per_request: "1",
              equity_percentage: "",
            })
            setApprovalImage(null)
            setApprovalPdf(null)
            setRejectReason("")
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Business Submission</DialogTitle>
            <DialogDescription>
              {approvalDialog.action === "choose"
                ? `Review "${approvalDialog.business?.title}" and decide to approve or reject`
                : approvalDialog.action === "approve"
                  ? `Approve "${approvalDialog.business?.title}"`
                  : `Reject "${approvalDialog.business?.title}"`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="font-semibold text-foreground">Business Details:</p>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <p>Name: {approvalDialog.business?.title}</p>
                <p>
                  Category:{" "}
                  {approvalDialog.business?.category_id && typeof approvalDialog.business.category_id === "object"
                    ? approvalDialog.business.category_id.name
                    : (approvalDialog.business?.category_id as string) || "N/A"}
                </p>
                <p>Entrepreneur: {approvalDialog.business?.entrepreneur_id?.name}</p>
              </div>
            </div>
            {approvalDialog.business?.business_plan_url && (
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <a href={approvalDialog.business.business_plan_url} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-4 w-4 mr-2" />
                  View Business Plan
                </a>
              </Button>
            )}

            {/* Initial Choice: Approve or Reject */}
            {approvalDialog.action === "choose" && (
              <div className="border-t pt-4 space-y-4">
                <p className="font-semibold text-foreground">Choose an action:</p>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => setApprovalDialog({ ...approvalDialog, action: "approve" })}
                    className="bg-[#1B4F91] h-24 flex flex-col items-center justify-center"
                  >
                    <span className="text-lg font-semibold">Approve</span>
                    <span className="text-sm opacity-90">Create public listing</span>
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setApprovalDialog({ ...approvalDialog, action: "reject" })}
                    className="h-24 flex flex-col items-center justify-center"
                  >
                    <span className="text-lg font-semibold">Reject</span>
                    <span className="text-sm opacity-90">Decline submission</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Approval Form Fields - Show only when action is "approve" */}
            {approvalDialog.action === "approve" && (
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground">Approval Details (Required for approval):</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setApprovalDialog({ ...approvalDialog, action: "choose" })}
                  >
                    Change Decision
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="approval-description">Description *</Label>
                  <textarea
                    id="approval-description"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                    placeholder="Enter business description..."
                    value={approvalFormData.description}
                    onChange={(e) => setApprovalFormData({ ...approvalFormData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="approval-total-shares">Total Shares *</Label>
                    <Input
                      id="approval-total-shares"
                      type="number"
                      placeholder="e.g., 1000"
                      value={approvalFormData.total_shares}
                      onChange={(e) => setApprovalFormData({ ...approvalFormData, total_shares: e.target.value })}
                      required
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="approval-share-value">Share Value (USD) *</Label>
                    <Input
                      id="approval-share-value"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 10.00"
                      value={approvalFormData.share_value}
                      onChange={(e) => setApprovalFormData({ ...approvalFormData, share_value: e.target.value })}
                      required
                      min="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="approval-min-shares">Minimum Shares per Request</Label>
                    <Input
                      id="approval-min-shares"
                      type="number"
                      placeholder="e.g., 1"
                      value={approvalFormData.minimum_shares_per_request}
                      onChange={(e) =>
                        setApprovalFormData({ ...approvalFormData, minimum_shares_per_request: e.target.value })
                      }
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="approval-equity">Equity Percentage (%)</Label>
                    <Input
                      id="approval-equity"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 20.00"
                      value={approvalFormData.equity_percentage}
                      onChange={(e) => setApprovalFormData({ ...approvalFormData, equity_percentage: e.target.value })}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                {/* Calculated Needed Funds Display */}
                {approvalFormData.total_shares && approvalFormData.share_value && (
                  <div className="bg-muted/50 p-4 rounded-lg border border-border">
                    <p className="text-sm font-medium text-foreground mb-1">Calculated Funding Needed:</p>
                    <p className="text-lg font-semibold text-[#1B4F91]">
                      ${(
                        Number.parseFloat(approvalFormData.total_shares || "0") *
                        Number.parseFloat(approvalFormData.share_value || "0")
                      ).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {approvalFormData.total_shares} shares × ${approvalFormData.share_value} per share
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Business Image (Optional)</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4">
                      {approvalImage ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">{approvalImage.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(approvalImage.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => setApprovalImage(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center cursor-pointer py-2">
                          <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                          <span className="text-xs font-medium text-foreground">Click to upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => setApprovalImage(e.target.files?.[0] || null)}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Business PDF (Optional)</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4">
                      {approvalPdf ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">{approvalPdf.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(approvalPdf.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => setApprovalPdf(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center cursor-pointer py-2">
                          <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                          <span className="text-xs font-medium text-foreground">Click to upload</span>
                          <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => setApprovalPdf(e.target.files?.[0] || null)}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rejection Section - Show only when action is "reject" */}
            {approvalDialog.action === "reject" && (
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground">Rejection Details:</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setApprovalDialog({ ...approvalDialog, action: "choose" })}
                  >
                    Change Decision
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                  <textarea
                    id="rejection-reason"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                    placeholder="Provide reason for rejection..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={4}
                    required
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setApprovalDialog({ open: false, business: null, action: null })
                setApprovalFormData({
                  description: "",
                  total_shares: "",
                  share_value: "",
                  minimum_shares_per_request: "1",
                  equity_percentage: "",
                })
                setApprovalImage(null)
                setApprovalPdf(null)
                setRejectReason("")
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            {approvalDialog.action === "reject" && (
              <Button variant="destructive" onClick={handleReject} disabled={isSubmitting || !rejectReason}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Rejection
              </Button>
            )}
            {approvalDialog.action === "approve" && (
              <Button
                onClick={handleApprove}
                disabled={
                  isSubmitting ||
                  !approvalFormData.description ||
                  !approvalFormData.total_shares ||
                  !approvalFormData.share_value
                }
                className="bg-[#1B4F91]"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Approval
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Public Business Dialog */}
      <Dialog open={createPublicDialog} onOpenChange={setCreatePublicDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Public Business Listing</DialogTitle>
            <DialogDescription>Add a new business opportunity for investors to view</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pub-title">Business Title *</Label>
              <Input
                id="pub-title"
                placeholder="Enter business title"
                value={publicFormData.title}
                onChange={(e) => setPublicFormData({ ...publicFormData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pub-category">Category *</Label>
              <Select
                value={publicFormData.category}
                onValueChange={(value) => setPublicFormData({ ...publicFormData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length > 0 && categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pub-description">Description *</Label>
              <textarea
                id="pub-description"
                placeholder="Describe the business opportunity..."
                value={publicFormData.description}
                onChange={(e) => setPublicFormData({ ...publicFormData, description: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pub-shares">Total Shares *</Label>
                <Input
                  id="pub-shares"
                  type="number"
                  placeholder="e.g., 1000"
                  value={publicFormData.total_shares}
                  onChange={(e) => setPublicFormData({ ...publicFormData, total_shares: e.target.value })}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pub-share-value">Share Value (USD) *</Label>
                <Input
                  id="pub-share-value"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 10.00"
                  value={publicFormData.share_value}
                  onChange={(e) => setPublicFormData({ ...publicFormData, share_value: e.target.value })}
                  min="0.01"
                />
              </div>
            </div>
            {publicFormData.total_shares && publicFormData.share_value && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Funding Needed:</p>
                <p className="text-lg font-semibold text-[#1B4F91]">
                  ${(
                    Number.parseFloat(publicFormData.total_shares || "0") *
                    Number.parseFloat(publicFormData.share_value || "0")
                  ).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Business Image *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4">
                {publicImage ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{publicImage.name}</p>
                      <p className="text-xs text-muted-foreground">{(publicImage.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setPublicImage(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer py-4">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm font-medium text-foreground">Click to upload image</span>
                    <span className="text-xs text-muted-foreground">PNG, JPG, GIF up to 2MB</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setCreatePublicDialog(false)} disabled={isCreatingPublic}>
              Cancel
            </Button>
            <Button onClick={handleCreatePublicBusiness} disabled={isCreatingPublic} className="bg-[#1B4F91]">
              {isCreatingPublic && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
