"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

const cards = [
  { title: "SAFEs", text: "Grants the right to obtain equity at a future date." },
  { title: "Convertible Notes", text: "A loan that converts to stock at some point in the future." },
  { title: "Revenue Share", text: "A loan that is paid back based on revenue." },
  { title: "Simple Loans", text: "A straightforward loan with interest over time." },
]

export default function InvestmentContracts() {
  const slider = useRef<HTMLDivElement>(null)
  const pause = useRef(false)

  useEffect(() => {
    const interval = setInterval(() => {
      if (!slider.current || pause.current) return
      slider.current.scrollLeft += 1
      if (
        slider.current.scrollLeft + slider.current.clientWidth >=
        slider.current.scrollWidth
      ) {
        slider.current.scrollLeft = 0
      }
    }, 25)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="bg-[#F1F9FF] py-28 relative overflow-hidden">
      <div className="max-w-300 mx-auto px-6 text-center">
        <h2 className="text-[34px] font-medium text-gray-900 mb-2">
          How you earn a return depends <br /> on the investment contract
        </h2>
        <p className="text-gray-500 mb-20">
          Learn more with our resources for first-time investors.
        </p>

        <div className="relative">
          {/* Fade Masks */}
          <div className="absolute left-0 top-0 w-32 h-full bg-linear-to-r from-[#F1F9FF] to-transparent z-10" />
          <div className="absolute right-0 top-0 w-32 h-full bg-linear-to-l from-[#F1F9FF] to-transparent z-10" />

          {/* Chevron Left */}
          <button
            onClick={() => slider.current!.scrollLeft -= 260}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white border rounded-full w-9 h-9 flex items-center justify-center shadow"
          >
            ‹
          </button>

          {/* Chevron Right */}
          <button
            onClick={() => slider.current!.scrollLeft += 260}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white border rounded-full w-9 h-9 flex items-center justify-center shadow"
          >
            ›
          </button>

          {/* Slider */}
          <div
            ref={slider}
            onMouseEnter={() => (pause.current = true)}
            onMouseLeave={() => (pause.current = false)}
            className="flex gap-6 overflow-x-scroll scroll-smooth px-24 no-scrollbar"
          >
            {[...cards, ...cards].map((c, i) => (
              <motion.div
                key={i}
                className="min-w-65 bg-white rounded-xl border border-gray-200 p-5 text-left"
                whileHover={{ y: -6 }}
              >
                <h3 className="font-semibold text-gray-900 mb-2">{c.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{c.text}</p>
                <span className="text-sm text-blue-600 font-medium cursor-pointer">
                  Learn more →
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
