"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { publicApi } from "@/lib/api"

export default function TrustStats() {
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    totalRaised: 0,
    totalInvestors: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await publicApi.getStats()
        setStats({
          totalBusinesses: data.totalBusinesses || 0,
          totalRaised: data.totalRaised || 0,
          totalInvestors: data.totalInvestors || 0,
        })
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  const displayStats = [
    {
      label: "Active Businesses",
      value: isLoading ? "..." : stats.totalBusinesses.toString(),
    },
    {
      label: "Total Raised",
      value: isLoading
        ? "..."
        : stats.totalRaised >= 1000000
          ? `$${(stats.totalRaised / 1000000).toFixed(1)}M`
          : stats.totalRaised >= 1000
            ? `$${(stats.totalRaised / 1000).toFixed(0)}K`
            : `$${stats.totalRaised}`,
    },
    {
      label: "Total Investors",
      value: isLoading ? "..." : stats.totalInvestors.toString(),
    },
  ]

  return (
    <section className="py-8 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top label */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-xs font-semibold tracking-widest text-gray-500 mb-14"
        >
          JOIN OUR GROWING COMMUNITY OF INVESTORS
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          {displayStats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl md:text-5xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-gray-600 mt-2 text-lg">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
