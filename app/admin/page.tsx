"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { adminApi } from "@/lib/api"
import { Users, TrendingUp, DollarSign, UserCheck, Clock, ArrowUpRight, ArrowDownRight, Activity, Target, Wallet, Building2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

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

  const calculatePercentage = (part: number, total: number) => {
    if (total === 0) return 0
    return Math.round((part / total) * 100)
  }

  const activeBusinessPercentage = stats ? calculatePercentage(stats.activeBusinesses, stats.totalBusinesses) : 0
  const pendingInvestmentPercentage = stats ? calculatePercentage(stats.pendingInvestments, stats.totalInvestments) : 0
  const entrepreneurPercentage = stats ? calculatePercentage(stats.entrepreneurs, stats.totalUsers) : 0
  const investorPercentage = stats ? calculatePercentage(stats.investors, stats.totalUsers) : 0

  return (
    <DashboardLayout>
      <div className="space-y-8 p-6">
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-[#1B4F91] via-[#2563eb] to-[#3b82f6] bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">Monitor platform performance and key metrics</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1.5 text-xs font-medium">
                <Activity className="h-3 w-3 mr-1.5 text-green-500" />
                Live Data
              </Badge>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {/* Loading Skeleton for Hero Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="shadow-md">
                  <CardContent className="p-6">
                    <div className="h-32 animate-pulse bg-linear-to-br from-muted to-muted/50 rounded-lg" />
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Loading Skeleton for Secondary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="shadow-md">
                  <CardContent className="p-6">
                    <div className="h-24 animate-pulse bg-linear-to-br from-muted to-muted/50 rounded-lg" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Hero Stats - Primary Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <EnhancedStatCard
                title="Total Users"
                value={stats?.totalUsers || 0}
                description="Platform members"
                gradient="from-blue-500 to-blue-600"
                trend="+12%"
                trendUp={true}
              />
              <EnhancedStatCard
                title="Total Businesses"
                value={stats?.totalBusinesses || 0}
                description="Listed businesses"
                gradient="from-purple-500 to-purple-600"
                trend="+8%"
                trendUp={true}
              />
              <EnhancedStatCard
                title="Total Investments"
                value={stats?.totalInvestments || 0}
                description="Investment requests"
                gradient="from-emerald-500 to-emerald-600"
                trend="+15%"
                trendUp={true}
              />
              <EnhancedStatCard
                title="Total Funded"
                value={`$${(stats?.totalInvestmentAmount || 0).toLocaleString()}`}
                description="Approved investments"
                gradient="from-amber-500 to-amber-600"
                trend="+23%"
                trendUp={true}
              />
            </div>

            {/* User Distribution */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#1B4F91] to-[#2563eb] flex items-center justify-center shadow-md">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    User Distribution
                  </CardTitle>
                  <CardDescription>Breakdown of platform users by role</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {/* Entrepreneurs */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-[#1B4F91]" />
                          <span className="font-medium">Entrepreneurs</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{stats?.entrepreneurs || 0}</span>
                          <Badge variant="secondary" className="text-xs">
                            {entrepreneurPercentage}%
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-[#1B4F91] to-[#2563eb] rounded-full transition-all duration-500"
                          style={{ width: `${entrepreneurPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Investors */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-emerald-600" />
                          <span className="font-medium">Investors</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{stats?.investors || 0}</span>
                          <Badge variant="secondary" className="text-xs">
                            {investorPercentage}%
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                          style={{ width: `${investorPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-lg bg-linear-to-br from-[#1B4F91]/5 to-[#2563eb]/5 border border-[#1B4F91]/10">
                      <p className="text-2xl font-bold text-[#1B4F91]">{stats?.entrepreneurs || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">Total Entrepreneurs</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-linear-to-br from-emerald-500/5 to-emerald-600/5 border border-emerald-500/10">
                      <p className="text-2xl font-bold text-emerald-600">{stats?.investors || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">Total Investors</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business & Investment Status */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    Activity Overview
                  </CardTitle>
                  <CardDescription>Business and investment status metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {/* Active Businesses */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-purple-600" />
                          <span className="font-medium">Active Businesses</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{stats?.activeBusinesses || 0}</span>
                          <Badge variant="secondary" className="text-xs">
                            {activeBusinessPercentage}%
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                          style={{ width: `${activeBusinessPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Pending Investments */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-600" />
                          <span className="font-medium">Pending Investments</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{stats?.pendingInvestments || 0}</span>
                          <Badge variant="secondary" className="text-xs">
                            {pendingInvestmentPercentage}%
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                          style={{ width: `${pendingInvestmentPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-lg bg-linear-to-br from-purple-500/5 to-purple-600/5 border border-purple-500/10">
                      <p className="text-2xl font-bold text-purple-600">{stats?.activeBusinesses || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">Active Now</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-linear-to-br from-amber-500/5 to-amber-600/5 border border-amber-500/10">
                      <p className="text-2xl font-bold text-amber-600">{stats?.pendingInvestments || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">Awaiting Review</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Financial Overview */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-10 h-10 rounded-lg bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                  Financial Summary
                </CardTitle>
                <CardDescription>Investment and funding overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2 p-6 rounded-xl bg-linear-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-sm font-medium text-emerald-900">Total Funded</p>
                    </div>
                    <p className="text-3xl font-bold text-emerald-700">
                      ${(stats?.totalInvestmentAmount || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-emerald-600">Approved investments</p>
                  </div>

                  <div className="space-y-2 p-6 rounded-xl bg-linear-to-br from-blue-50 to-blue-100/50 border border-blue-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                        <Target className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-sm font-medium text-blue-900">Funding Requested</p>
                    </div>
                    <p className="text-3xl font-bold text-blue-700">
                      ${(stats?.totalFundingRequested || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-blue-600">Total amount sought</p>
                  </div>

                  <div className="space-y-2 p-6 rounded-xl bg-linear-to-br from-purple-50 to-purple-100/50 border border-purple-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-sm font-medium text-purple-900">Avg. Investment</p>
                    </div>
                    <p className="text-3xl font-bold text-purple-700">
                      ${stats?.totalInvestments ? Math.round((stats?.totalInvestmentAmount || 0) / stats.totalInvestments).toLocaleString() : 0}
                    </p>
                    <p className="text-xs text-purple-600">Per investment</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <CompactStatCard
                title="Active Businesses"
                value={stats?.activeBusinesses || 0}
                total={stats?.totalBusinesses || 0}
                icon={<Building2 className="h-4 w-4" />}
                color="purple"
              />
              <CompactStatCard
                title="Pending Investments"
                value={stats?.pendingInvestments || 0}
                total={stats?.totalInvestments || 0}
                icon={<Clock className="h-4 w-4" />}
                color="amber"
              />
              <CompactStatCard
                title="Entrepreneurs"
                value={stats?.entrepreneurs || 0}
                total={stats?.totalUsers || 0}
                icon={<UserCheck className="h-4 w-4" />}
                color="blue"
              />
              <CompactStatCard
                title="Investors"
                value={stats?.investors || 0}
                total={stats?.totalUsers || 0}
                icon={<TrendingUp className="h-4 w-4" />}
                color="emerald"
              />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

function EnhancedStatCard({
  title,
  value,
  description,
  gradient,
  trend,
  trendUp,
}: {
  title: string
  value: string | number
  description: string
  gradient: string
  trend?: string
  trendUp?: boolean
}) {
  return (
    <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-t-transparent hover:border-t-current group">
      <div className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between mb-4">
          {trend && (
            <Badge variant="secondary" className="text-xs font-semibold">
              {trendUp ? (
                <ArrowUpRight className="h-3 w-3 mr-0.5 text-green-600" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-0.5 text-red-600" />
              )}
              {trend}
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function CompactStatCard({
  title,
  value,
  total,
  icon,
  color,
}: {
  title: string
  value: number
  total: number
  icon: React.ReactNode
  color: "blue" | "purple" | "emerald" | "amber"
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0
  
  const colorClasses = {
    blue: {
      bg: "from-blue-500/10 to-blue-600/10",
      text: "text-blue-600",
      border: "border-blue-200",
      gradient: "from-blue-500 to-blue-600",
    },
    purple: {
      bg: "from-purple-500/10 to-purple-600/10",
      text: "text-purple-600",
      border: "border-purple-200",
      gradient: "from-purple-500 to-purple-600",
    },
    emerald: {
      bg: "from-emerald-500/10 to-emerald-600/10",
      text: "text-emerald-600",
      border: "border-emerald-200",
      gradient: "from-emerald-500 to-emerald-600",
    },
    amber: {
      bg: "from-amber-500/10 to-amber-600/10",
      text: "text-amber-600",
      border: "border-amber-200",
      gradient: "from-amber-500 to-amber-600",
    },
  }

  const classes = colorClasses[color]

  return (
    <Card className="shadow-md hover:shadow-lg transition-all duration-300">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-lg bg-linear-to-br ${classes.bg} flex items-center justify-center`}>
            <div className={classes.text}>{icon}</div>
          </div>
          <Badge variant="outline" className="text-xs">
            {percentage}%
          </Badge>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className={`text-2xl font-bold ${classes.text}`}>{value}</p>
            <p className="text-xs text-muted-foreground">/ {total}</p>
          </div>
        </div>
        <div className="mt-3 w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full bg-linear-to-r ${classes.gradient} rounded-full transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}