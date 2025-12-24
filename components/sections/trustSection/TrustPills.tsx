"use client"

import { motion } from "framer-motion"

const pills = [
  { icon: "🐶", text: "A cure for cancer in dogs" },
  { icon: "🗞", text: "Increasing media literacy" },
  { icon: "🛒", text: "A community-owned supermarket" },
  { icon: "💻", text: "A coding platform for kids" },
  { icon: "🍶", text: "Artisanal Korean Rice Wines made in Brooklyn" },
  { icon: "🌱", text: "Compostable cups" },
  { icon: "🏢", text: "Flexible reality workspaces" },
]

function PillRow({
  reverse = false,
  duration = 40,
}: {
  reverse?: boolean
  duration?: number
}) {
  return (
    <div className="relative overflow-hidden">
      <motion.div
        className="flex gap-4 whitespace-nowrap"
        animate={{
          x: reverse ? ["-50%", "0%"] : ["0%", "-50%"],
        }}
        transition={{
          duration,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {[...pills, ...pills].map((pill, i) => (
          <div
            key={i}
            className="flex items-center gap-2
                       px-4 py-2
                       rounded-full
                       bg-white
                       border border-gray-200
                       text-sm text-gray-700
                       shadow-sm"
          >
            <span className="text-base leading-none">
              {pill.icon}
            </span>
            <span>{pill.text}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export default function TrustPills() {
  return (
    <section className="relative mt-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-linear-to-r from-white to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-linear-to-l from-white to-transparent z-10" />

      <div className="space-y-4">
        {/* Top row */}
        <PillRow duration={38} />

        {/* Bottom row (slightly offset speed) */}
        <PillRow reverse duration={42} />
      </div>
    </section>
  )
}
