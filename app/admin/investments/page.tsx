"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { adminApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, Clock, DollarSign } from "lucide-react"

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

  const handleStatusUpdate = async (id: string, status: string) => {
    if (!token) return
    try {
      await adminApi.updateInvestmentStatus(id, status, token)
      toast({ title: "Success", description: `Investment ${status}` })
      fetchInvestments()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Investments</h1>
          <p className="text-muted-foreground">Review and manage investment requests</p>
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
        ) : investments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No investments found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {investments.map((investment) => (
              <Card key={investment._id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground text-lg">{investment.business_id?.title}</h3>
                        <Badge className={getStatusColor(investment.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(investment.status)}
                            {investment.status}
                          </span>
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />${investment.amount.toLocaleString()}
                        </span>
                        <span>Investor: {investment.investor_id?.name} ({investment.investor_id?.email})</span>
                        <span>Category: {investment.business_id?.category}</span>
                        <span>Date: {new Date(investment.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {investment.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleStatusUpdate(investment._id, "approved")}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusUpdate(investment._id, "rejected")}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
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
    </DashboardLayout>
  )
}
