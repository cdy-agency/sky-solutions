"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"
import { shareApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

interface ShareRequest {
  _id: string
  investor_id: {
    _id: string
    name: string
    email: string
    phone: string
  }
  business_id: {
    _id: string
    title: string
  }
  requested_shares: number
  share_value: number
  total_amount: number
  status: "pending" | "approved" | "rejected"
  created_at: string
}

export default function AdminShareRequestsPage() {
  const { token } = useAuth()
  const { toast } = useToast()

  const [shareRequests, setShareRequests] = useState<ShareRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<ShareRequest | null>(null)
  const [approveDialog, setApproveDialog] = useState(false)
  const [approvedShares, setApprovedShares] = useState("")
  const [isApproving, setIsApproving] = useState(false)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  useEffect(() => {
    fetchShareRequests()
  }, [token, page])

  const fetchShareRequests = async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const data = await shareApi.getPendingRequests(token, page, limit)
      setShareRequests(data.shareRequests || [])
    } catch (error) {
      console.error("Failed to fetch share requests:", error)
      toast({ title: "Error", description: "Failed to load share requests", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveRequest = async () => {
    if (!selectedRequest || !approvedShares || !token) return
    setIsApproving(true)
    try {
      await shareApi.approveRequest(selectedRequest._id, { approved_shares: Number.parseInt(approvedShares) }, token)
      toast({ title: "Success", description: "Share request approved" })
      setApproveDialog(false)
      setSelectedRequest(null)
      setApprovedShares("")
      fetchShareRequests()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsApproving(false)
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    if (!token) return
    try {
      await shareApi.rejectRequest(requestId, { rejection_reason: "Rejected by admin" }, token)
      toast({ title: "Success", description: "Share request rejected" })
      fetchShareRequests()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Share Requests</h1>
          <p className="text-muted-foreground">Review and approve investor share purchase requests</p>
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
        ) : shareRequests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No pending share requests</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {shareRequests.map((request) => (
              <Card key={request._id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground text-lg">{request.business_id?.title}</h3>
                          <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-muted-foreground mb-1">Investor</p>
                        <p className="font-semibold text-foreground">{request.investor_id?.name}</p>
                        <p className="text-xs text-muted-foreground">{request.investor_id?.email}</p>
                        <p className="text-xs text-muted-foreground">{request.investor_id?.phone}</p>
                      </div>

                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-muted-foreground mb-1">Request Details</p>
                        <p className="font-semibold text-foreground">
                          {request.requested_shares} shares @ ${request.share_value}/share
                        </p>
                        <p className="text-xs text-muted-foreground">Total: ${request.total_amount.toLocaleString()}</p>
                      </div>
                    </div>

                    {request.status === "pending" && (
                      <div className="flex gap-2">
                        <Button variant="destructive" size="sm" onClick={() => handleRejectRequest(request._id)}>
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="bg-[#1B4F91]"
                          onClick={() => {
                            setSelectedRequest(request)
                            setApprovedShares(request.requested_shares.toString())
                            setApproveDialog(true)
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Approve Dialog */}
      <Dialog open={approveDialog} onOpenChange={setApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Share Request</DialogTitle>
            <DialogDescription>Approve shares for {selectedRequest?.investor_id?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Business</p>
              <p className="font-semibold text-foreground">{selectedRequest?.business_id?.title}</p>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Requested Shares</p>
              <p className="font-semibold text-foreground">{selectedRequest?.requested_shares}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="approved-shares">Number of Shares to Approve *</Label>
              <Input
                id="approved-shares"
                type="number"
                min="1"
                max={selectedRequest?.requested_shares}
                value={approvedShares}
                onChange={(e) => setApprovedShares(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Can approve up to {selectedRequest?.requested_shares} shares
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApproveRequest} disabled={!approvedShares || isApproving} className="bg-[#1B4F91]">
              {isApproving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Approve
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
