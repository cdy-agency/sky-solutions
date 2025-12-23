"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { investorApi } from "@/lib/api"
import { Search, DollarSign, MapPin, ExternalLink } from "lucide-react"

interface Business {
  _id: string
  title: string
  funded_amount: number
  category: string
  description: string
  needed_funds: number
  image_url?: string
  entrepreneur_id: { name: string; location: string }
}

const categories = [
  "All Categories",
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "E-commerce",
  "Food & Beverage",
  "Real Estate",
  "Manufacturing",
  "Services",
  "Other",
]

export default function BrowseBusinessesPage() {
  const { token } = useAuth()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All Categories")

  const fetchBusinesses = async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const params: any = {}
      if (search) params.search = search
      if (category !== "All Categories") params.category = category

      const data = await investorApi.getBusinesses(token, params)
      setBusinesses(data)
    } catch (error) {
      console.error("Failed to fetch businesses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBusinesses()
  }, [token])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBusinesses()
    }, 500)
    return () => clearTimeout(timer)
  }, [search, category])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Browse Businesses</h1>
          <p className="text-muted-foreground">Discover investment opportunities</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search businesses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Business Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <div className="h-48 animate-pulse bg-muted" />
                  <div className="p-4 space-y-2">
                    <div className="h-6 w-3/4 animate-pulse bg-muted rounded" />
                    <div className="h-4 w-1/2 animate-pulse bg-muted rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No businesses found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => (
              <Card key={business._id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="h-40 bg-muted flex items-center justify-center">
                    {business.image_url ? (
                      <img
                        src={business.image_url || "/placeholder.svg"}
                        alt={business.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-muted-foreground/30">{business.title.charAt(0)}</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground line-clamp-1 mb-1">{business.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{business.category}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{business.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4" />
                      <span>{business.entrepreneur_id?.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-sm font-medium text-foreground">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {(business.needed_funds - business.funded_amount).toLocaleString()}
                      </span>
                      <Link href={`/investor/browse/${business._id}`}>
                        <Button size="sm">
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
      </div>
    </DashboardLayout>
  )
}
