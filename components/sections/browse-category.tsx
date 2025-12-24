"use client"

import { motion } from "framer-motion"

const categories = [
  "Other",
  "Restaurant",
  "Fin",
  "Tech",
  "Healthcare",
  "Music",
  "Grocery",
  "Robotics",
  "Ecommerce",
  "Education",
  "Female Founders",
  "7-Coordinator",
]

const founder = {
  name: "Red Ray Coffee",
  description: "Award-winning barista team building the future of coffee",
  location: "San Francisco, CA",
  raised: "$132,000",
  image: "/images/coffee.png",
}

export default function BrowseCategory() {
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
                  {categories.slice(0, 6).map((cat, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:border-gray-400 transition"
                    >
                      {cat}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Founder */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Browse by founder</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(6, 12).map((cat, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:border-gray-400 transition"
                    >
                      {cat}
                    </motion.button>
                  ))}
                </div>
              </div>

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

          {/* Featured Founder Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-linear-to-br from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200"
          >
            <div className="aspect-video rounded mb-4 overflow-hidden flex items-center justify-center bg-gray-100">
              <img src={founder.image} alt={founder.name} className="object-cover w-full h-full" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{founder.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{founder.description}</p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>{founder.location}</p>
              <p>Raised: {founder.raised}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
