"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { entrepreneurApi } from "@/lib/api"
import { ArrowLeft, Edit, DollarSign, FileText, ExternalLink } from "lucide-react"

interface Business {
  _id: string
  title: string
  category: string
  description: string
  needed_funds: number
  status: string
  image_url?: string
  pdf_url?: string
  created_at: string
  updated_at: string
}

export default function BusinessDetailPage() {
  const { id } = useParams()
  const { token } = useAuth()
  const router = useRouter()
  const [business, setBusiness] = useState<Business | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!token || !id) return
      try {
        const data = await entrepreneurApi.getBusiness(id as string, token)
        setBusiness(data)
      } catch (error) {
        console.error("Failed to fetch business:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBusiness()
  }, [token, id])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-8 w-32 animate-pulse bg-muted rounded" />
          <div className="h-64 animate-pulse bg-muted rounded" />
        </div>
      </DashboardLayout>
    )
  }

  if (!business) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Business not found</p>
            <Link href="/entrepreneur/businesses">
              <Button className="mt-4">Back to Businesses</Button>
            </Link>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "disabled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">{business.title}</h1>
          <Badge className={getStatusColor(business.status)}>{business.status}</Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            {business.image_url && (
              <Card>
                <CardContent className="p-0">
                  <img
                    src={business.image_url || "/placeholder.svg"}
                    alt={business.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{business.description}</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium text-foreground">{business.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Funding Required</p>
                  <p className="font-medium text-foreground flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {business.needed_funds?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium text-foreground">{new Date(business.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium text-foreground">{new Date(business.updated_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/entrepreneur/businesses/${business._id}/edit`} className="block">
                  <Button className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Business
                  </Button>
                </Link>
                {business.pdf_url && (
                  <a href={business.pdf_url} target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="outline" className="w-full bg-transparent">
                      <FileText className="h-4 w-4 mr-2" />
                      View Business Plan
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
