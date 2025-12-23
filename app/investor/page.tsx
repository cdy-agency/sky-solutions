"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { investorApi } from "@/lib/api"
import { Briefcase, TrendingUp, DollarSign, Clock, CheckCircle } from "lucide-react"

interface Investment {
  _id: string
  amount: number
  status: string
  business_id: { title: string; category: string; status: string; needed_funds: number }
  created_at: string
}

export default function InvestorDashboard() {
  const { token, user } = useAuth()
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

  const stats = {
    total: investments.length,
    pending: investments.filter((i) => i.status === "pending").length,
    approved: investments.filter((i) => i.status === "approved").length,
    totalInvested: investments.filter((i) => i.status === "approved").reduce((sum, i) => sum + i.amount, 0),
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome, {user?.name}!</h1>
            <p className="text-muted-foreground">Track your investments</p>
          </div>
          <Link href="/investor/browse">
            <Button>
              <Briefcase className="h-4 w-4 mr-2" />
              Browse Businesses
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Investments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Invested</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">${stats.totalInvested.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Investments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Investments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse bg-muted rounded" />
                ))}
              </div>
            ) : investments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't made any investments yet</p>
                <Link href="/investor/browse">
                  <Button>Browse Businesses</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {investments.slice(0, 5).map((investment) => (
                  <div
                    key={investment._id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border"
                  >
                    <div>
                      <h3 className="font-medium text-foreground">{investment.business_id?.title}</h3>
                      <p className="text-sm text-muted-foreground">{investment.business_id?.category}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-foreground">${investment.amount.toLocaleString()}</span>
                      <Badge className={getStatusColor(investment.status)}>{investment.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
