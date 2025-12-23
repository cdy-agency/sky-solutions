"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { adminApi } from "@/lib/api"
import { Users, Briefcase, TrendingUp, DollarSign, UserCheck, Clock } from "lucide-react"

interface Stats {
  totalUsers: number
  totalBusinesses: number
  totalInvestments: number
  activeBusinesses: number
  pendingInvestments: number
  entrepreneurs: number
  investors: number
  totalFundingRequested: number
  totalInvestmentAmount: number
}

export default function AdminDashboard() {
  const { token } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return
      try {
        const data = await adminApi.getStats(token)
        setStats(data)
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [token])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of the platform</p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-20 animate-pulse bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Users"
              value={stats?.totalUsers || 0}
              icon={<Users className="h-5 w-5" />}
              description="Entrepreneurs & Investors"
            />
            <StatCard
              title="Entrepreneurs"
              value={stats?.entrepreneurs || 0}
              icon={<UserCheck className="h-5 w-5" />}
              description="Registered entrepreneurs"
            />
            <StatCard
              title="Investors"
              value={stats?.investors || 0}
              icon={<TrendingUp className="h-5 w-5" />}
              description="Registered investors"
            />
            <StatCard
              title="Total Businesses"
              value={stats?.totalBusinesses || 0}
              icon={<Briefcase className="h-5 w-5" />}
              description="All business listings"
            />
            <StatCard
              title="Active Businesses"
              value={stats?.activeBusinesses || 0}
              icon={<Briefcase className="h-5 w-5" />}
              description="Currently active"
            />
            <StatCard
              title="Total Investments"
              value={stats?.totalInvestments || 0}
              icon={<TrendingUp className="h-5 w-5" />}
              description="Investment requests"
            />
            <StatCard
              title="Pending Investments"
              value={stats?.pendingInvestments || 0}
              icon={<Clock className="h-5 w-5" />}
              description="Awaiting approval"
            />
            <StatCard
              title="Total Funded"
              value={`$${(stats?.totalInvestmentAmount || 0).toLocaleString()}`}
              icon={<DollarSign className="h-5 w-5" />}
              description="Approved investments"
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

function StatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  description: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
