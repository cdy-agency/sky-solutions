"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { adminApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, Clock, DollarSign, TrendingUp, Users, Building2, AlertCircle } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Investment {
  _id: string
  amount: number
  status: string
  investor_id: { name: string; email: string }
  business_id: { title: string; category: string }
  created_at: string
}

export default function AdminInvestmentsPage() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    investment: Investment | null
    action: "approved" | "rejected" | null
  }>({
    open: false,
    investment: null,
    action: null,
  })

  const fetchInvestments = async () => {
    if (!token) return
    try {
      const data = await adminApi.getInvestments(token)
      setInvestments(data)
    } catch (error) {
      console.error("Failed to fetch investments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInvestments()
  }, [token])

  const handleStatusUpdate = async () => {
    if (!token || !confirmDialog.investment || !confirmDialog.action) return
    try {
      await adminApi.updateInvestmentStatus(confirmDialog.investment._id, confirmDialog.action, token)
      toast({ 
        title: "Success", 
        description: `Investment ${confirmDialog.action} successfully` 
      })
      setConfirmDialog({ open: false, investment: null, action: null })
      fetchInvestments()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const openConfirmDialog = (investment: Investment, action: "approved" | "rejected") => {
    setConfirmDialog({ open: true, investment, action })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "rejected":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-3.5 w-3.5" />
      case "pending":
        return <Clock className="h-3.5 w-3.5" />
      case "rejected":
        return <XCircle className="h-3.5 w-3.5" />
      default:
        return null
    }
  }

  // Calculate stats
  const totalInvestments = investments.length
  const pendingInvestments = investments.filter((i) => i.status === "pending").length
  const approvedInvestments = investments.filter((i) => i.status === "approved").length
  const rejectedInvestments = investments.filter((i) => i.status === "rejected").length
  const totalAmount = investments.reduce((sum, i) => sum + i.amount, 0)
  const approvedAmount = investments
    .filter((i) => i.status === "approved")
    .reduce((sum, i) => sum + i.amount, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-[#1B4F91] via-[#2563eb] to-[#3b82f6] bg-clip-text text-transparent">
            Investment Management
          </h1>
          <p className="text-muted-foreground">Review and manage investment requests</p>
        </div>

        {/* Investments Table */}
        <Card className="shadow-lg ">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#1B4F91] to-[#2563eb] flex items-center justify-center shadow-md">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  Investment Requests
                </CardTitle>
                <CardDescription className="mt-1">
                  {totalInvestments} total investments · {pendingInvestments} pending review
                </CardDescription>
              </div>
              {pendingInvestments > 0 && (
                <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-700">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {pendingInvestments} pending
                </Badge>
              )}
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse bg-linear-to-r from-muted to-muted/50 rounded" />
                ))}
              </div>
            ) : investments.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-linear-to-br from-muted to-muted/50 flex items-center justify-center">
                  <TrendingUp className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No investments found</h3>
                <p className="text-muted-foreground">Investment requests will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Business</TableHead>
                      <TableHead className="font-semibold">Investor</TableHead>
                      <TableHead className="font-semibold">Amount</TableHead>
                      <TableHead className="font-semibold">Category</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investments.map((investment) => (
                      <TableRow key={investment._id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                              <Building2 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{investment.business_id?.title}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#1B4F91] to-[#2563eb] flex items-center justify-center text-white text-xs font-semibold shadow-md">
                              {investment.investor_id?.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{investment.investor_id?.name}</p>
                              <p className="text-xs text-muted-foreground">{investment.investor_id?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="h-4 w-4 text-emerald-600" />
                            <span className="font-semibold text-emerald-700">
                              {investment.amount.toLocaleString()} Frw
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {investment.business_id?.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(investment.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(investment.status)}>
                            <span className="flex items-center gap-1.5">
                              {getStatusIcon(investment.status)}
                              <span className="capitalize">{investment.status}</span>
                            </span>
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => !open && setConfirmDialog({ open: false, investment: null, action: null })}
      >
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  confirmDialog.action === "approved"
                    ? "bg-linear-to-br from-green-500 to-green-600"
                    : "bg-linear-to-br from-red-500 to-red-600"
                }`}
              >
                {confirmDialog.action === "approved" ? (
                  <CheckCircle className="h-5 w-5 text-white" />
                ) : (
                  <XCircle className="h-5 w-5 text-white" />
                )}
              </div>
              {confirmDialog.action === "approved" ? "Approve Investment" : "Reject Investment"}
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              {confirmDialog.action === "approved" ? (
                <>
                  Are you sure you want to approve this investment of{" "}
                  <span className="font-semibold text-foreground">
                    {confirmDialog.investment?.amount.toLocaleString()} Frw
                  </span>{" "}
                  for <span className="font-semibold text-foreground">{confirmDialog.investment?.business_id?.title}</span>?
                </>
              ) : (
                <>
                  Are you sure you want to reject this investment from{" "}
                  <span className="font-semibold text-foreground">{confirmDialog.investment?.investor_id?.name}</span>?
                  This action cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ open: false, investment: null, action: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              className={
                confirmDialog.action === "approved"
                  ? "bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  : "bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              }
            >
              {confirmDialog.action === "approved" ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Investment
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Investment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}