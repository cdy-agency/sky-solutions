"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import Link from "next/link"
import { investorApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, MapPin } from "lucide-react"

interface Business {
  _id: string
  title: string
  category: string
  description: string
  needed_funds: number
  image_url?: string
  entrepreneur_id?: { name: string; location: string }
}

export default function ExploreStartups() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPublicBusinesses = async () => {
      try {
        setIsLoading(true)
        const data = await investorApi.getBusinesses("", {})
        // Display only first 4 businesses on homepage
        setBusinesses(data.slice(0, 4))
      } catch (error) {
        console.error("[v0] Failed to fetch public businesses:", error)
        setBusinesses([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPublicBusinesses()
  }, [])

  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Explore Businesses Raising Now</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover promising investment opportunities from verified entrepreneurs
          </p>
        </div>

        {/* Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-0">
                  <div className="h-48 bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No businesses available yet. Check back soon!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {businesses.map((business, i) => (
              <motion.div
                whileHover={{ y: -6 }}
                key={business._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="rounded-xl overflow-hidden h-full flex flex-col">
                  <CardContent className="p-0 flex-1 flex flex-col">
                    {/* Image */}
                    <div className="relative h-48 bg-muted flex items-center justify-center overflow-hidden">
                      {business.image_url ? (
                        <img
                          src={business.image_url || "/placeholder.svg"}
                          alt={business.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-5xl font-bold text-muted-foreground/20">
                          {business.title.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Body */}
                    <div className="pt-4 px-4 pb-4 flex-1 flex flex-col">
                      <p className="text-xs text-muted-foreground mb-1 font-medium">{business.category}</p>
                      <h3 className="font-semibold text-foreground leading-snug mb-2 line-clamp-2">{business.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{business.description}</p>

                      {/* Location if available */}
                      {business.entrepreneur_id?.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                          <MapPin className="h-3 w-3" />
                          <span className="line-clamp-1">{business.entrepreneur_id.location}</span>
                        </div>
                      )}

                      {/* Funding Amount */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
                          <DollarSign className="h-4 w-4" />
                          {(business.needed_funds / 1000).toFixed(0)}K
                        </span>
                        <Link href={`/investor/browse/${business._id}`}>
                          <Button size="sm" variant="ghost">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA */}
        {businesses.length > 0 && (
          <div className="flex justify-center mt-14">
            <Link href="/register?role=investor">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Explore All Opportunities
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
