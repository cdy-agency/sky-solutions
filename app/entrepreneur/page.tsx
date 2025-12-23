"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { entrepreneurApi } from "@/lib/api"
import { Plus, Briefcase, DollarSign, Clock } from "lucide-react"

interface Business {
  _id: string
  title: string
  category: string
  status: string
  created_at: string
}

export default function EntrepreneurDashboard() {
  const { token, user } = useAuth()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBusinesses = async () => {
      if (!token) return
      try {
        const data = await entrepreneurApi.getBusinesses(token)
        setBusinesses(data)
      } catch (error) {
        console.error("Failed to fetch businesses:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBusinesses()
  }, [token])

  const stats = {
    total: businesses.length,
    active: businesses.filter((b) => b.status === "active").length,
    draft: businesses.filter((b) => b.status === "draft").length,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome, {user?.name}!</h1>
            <p className="text-muted-foreground">Manage your business listings</p>
          </div>
          <Link href="/entrepreneur/businesses/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Business
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Businesses</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
              <Briefcase className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.draft}</div>
            </CardContent>
          </Card>
       
        </div>

        {/* Recent Businesses */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Businesses</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse bg-muted rounded" />
                ))}
              </div>
            ) : businesses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't created any businesses yet</p>
                <Link href="/entrepreneur/businesses/new">
                  <Button>Create Your First Business</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {businesses.slice(0, 5).map((business) => (
                  <Link key={business._id} href={`/entrepreneur/businesses/${business._id}`}>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div>
                        <h3 className="font-medium text-foreground">{business.title}</h3>
                        <p className="text-sm text-muted-foreground">{business.category}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          className={
                            business.status === "active"
                              ? "bg-green-100 text-green-800"
                              : business.status === "draft"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }
                        >
                          {business.status}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
