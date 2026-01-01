"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { investorApi } from "@/lib/api"
import { DollarSign, Calendar, CheckCircle, Clock, XCircle } from "lucide-react"

interface Investment {
  _id: string
  amount: number
  status: string
  business_id: {
    title: string
    category: string
    status: string
    needed_funds: number
  }
  created_at: string
}

export default function InvestorInvestmentsPage() {
  const { token } = useAuth()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchInvestments = async () => {
      if (!token) return
      try {
        const data = await investorApi.getInvestments(token)
        setInvestments(data)
      } catch (error) {
        console.error("Failed to fetch investments:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchInvestments()
  }, [token])

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
          <h1 className="text-3xl font-bold text-foreground">My Investments</h1>
          <p className="text-muted-foreground">Track all your investment requests</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-20 animate-pulse bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : investments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">You haven't made any investments yet</p>
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
                        <span>Category: {investment.business_id?.category}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(investment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Investment Amount</p>
                      <p className="text-2xl font-bold text-foreground flex items-center justify-end">
                        <DollarSign className="h-5 w-5" />
                        {investment.amount.toLocaleString()}
                      </p>
                    </div>
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
