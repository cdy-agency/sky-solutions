"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { entrepreneurApi } from "@/lib/api"
import { Plus, ExternalLink } from "lucide-react"

interface Business {
  _id: string
  title: string
  category: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  rejection_reason?: string
}

export default function EntrepreneurBusinessesPage() {
  const { token } = useAuth()
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Business Submissions</h1>
            <p className="text-muted-foreground">View status of your submitted businesses</p>
          </div>
          <Link href="/entrepreneur/businesses/new">
            <Button className="bg-[#1B4F91]">
              <Plus className="h-4 w-4 mr-2" />
              Submit Business
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
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
              <p className="text-muted-foreground mb-4">You haven't submitted any businesses yet</p>
              <Link href="/entrepreneur/businesses/new">
                <Button className="bg-[#1B4F91]">Submit Your First Business</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {businesses.map((business) => (
              <Card key={business._id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground text-lg">{business.title}</h3>
                        <Badge className={getStatusColor(business.status)}>{business.status}</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>Category: {business.category}</p>
                        <p>Submitted: {new Date(business.created_at).toLocaleDateString()}</p>
                        {business.status === "rejected" && business.rejection_reason && (
                          <p className="text-red-600 font-medium">Reason: {business.rejection_reason}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/entrepreneur/businesses/${business._id}`}>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Information Section */}
        <Card className="border-[#D4A84B] bg-blue-50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-[#1B4F91] mb-2">How It Works</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>1. Submit your business name, category, and business plan</li>
              <li>2. Our admin team reviews your submission</li>
              <li>3. If approved, the admin creates a public listing with full details</li>
              <li>4. Investors can then view and invest in your business</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
