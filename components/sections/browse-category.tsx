"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import Link from "next/link"
import { publicApi } from "@/lib/api"

interface Category {
  _id: string
  name: string
  description?: string
}

interface Business {
  _id: string
  title: string
  description: string
  image_url?: string
  entrepreneur_id?: { name: string; location: string }
  remaining_shares?: number
  share_value?: number
}

export default function BrowseCategory() {
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredBusiness, setFeaturedBusiness] = useState<Business | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [categoriesData, businessesData] = await Promise.all([
          publicApi.getCategories(),
          publicApi.getBusinesses({ limit: 1 }),
        ])
        setCategories(categoriesData || [])
        if (businessesData.businesses && businessesData.businesses.length > 0) {
          setFeaturedBusiness(businessesData.businesses[0])
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            From tomorrow's unicorns to today's opportunities
          </h2>
          <p className="text-gray-600">
            Invest to bring tomorrow's unicorns in, strengthen local communities, build a portfolio of long-term and
            angel investments.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="space-y-4">
              {/* Industry */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Browse by industry</h3>
                <div className="flex flex-wrap gap-2">
                  {isLoading ? (
                    <div className="flex gap-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" />
                      ))}
                    </div>
                  ) : categories.length > 0 ? (
                    categories.slice(0, 6).map((cat) => (
                      <Link key={cat._id} href={`/register?role=investor&category=${cat._id}`}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          className="px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:border-gray-400 transition"
                        >
                          {cat.name}
                        </motion.button>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No categories available</p>
                  )}
                </div>
              </div>

              {/* More Categories */}
              {categories.length > 6 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">More categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.slice(6, 12).map((cat) => (
                      <Link key={cat._id} href={`/register?role=investor&category=${cat._id}`}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          className="px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:border-gray-400 transition"
                        >
                          {cat.name}
                        </motion.button>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Stage */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Browse by stage</h3>
                <div className="flex flex-wrap gap-2">
                  {["Pre-Seed", "Seed", "Series A", "Series B"].map((stage, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:border-gray-400 transition"
                    >
                      {stage}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Featured Business Card */}
          {featuredBusiness && (
            <Link href={`/investor/browse/${featuredBusiness._id}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-linear-to-br from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200 hover:shadow-lg transition cursor-pointer"
              >
                <div className="aspect-video rounded mb-4 overflow-hidden flex items-center justify-center bg-gray-100">
                  {featuredBusiness.image_url ? (
                    <img
                      src={featuredBusiness.image_url}
                      alt={featuredBusiness.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-gray-400">
                      {featuredBusiness.title.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{featuredBusiness.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{featuredBusiness.description || "No description"}</p>
                <div className="space-y-2 text-sm text-gray-600">
                  {featuredBusiness.entrepreneur_id?.location && <p>{featuredBusiness.entrepreneur_id.location}</p>}
                  {featuredBusiness.remaining_shares !== undefined &&
                    featuredBusiness.share_value !== undefined && (
                      <p>
                        Available: {featuredBusiness.remaining_shares} shares @ RWF{" "}
                        {featuredBusiness.share_value.toLocaleString()}
                      </p>
                    )}
                </div>
              </motion.div>
            </Link>
          )}
          {!featuredBusiness && !isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-linear-to-br from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200"
            >
              <p className="text-sm text-gray-600">No featured business available</p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
