"use client"

import { motion } from "framer-motion"

const startups = [
  {
    tag: "Almost Fully Funded",
    image: "/images/start1.png",
    name: "RISE Robotics",
    title: "Electrifying heavy machines",
    desc: " $22M raised from Techstars & The Engine (MIT’s VC). Enabling AI-ready, autonomous machines in a $600B market",
    chips: ["VC-BACKED", "$1M+ REVENUE", "REPEAT FOUNDER"],
  },
  {
    tag: "Trending This Week",
    image: "/images/start2.png",
    name: "Sen-Jam Pharmaceutical",
    title: "Transforming Systematic Inflammation – The Hidden Killer – Into Longer, Healthier Lives",
    desc: "$730M+ in exits by leadership team",
    chips: ["VC-BACKED", "FEMALE FOUNDER", "BIOTECH"],
  },
  {
    tag: "Trending This Week",
    image: "/images/start3.png",
    name: "Olympian Motors (YC W22)",
    title: "Art-deco electric vehicles",
    desc: "$61M revenue backlog with 780 pre-orders. Strategic partnerships with NVIDIA, Google, and Foxconn",
    chips: ["VC-BACKED", "Y COMBINATOR", "TRANSPORTATION"],
  },
  {
    tag: "Almost Fully Funded",
    image: "/images/start4.png",
    name: "Noble Mobile",
    title: "Get Paid To Drive",
    desc: "Co-founded by mobile carrier executives",
    chips: ["VC-BACKED", "REPEAT FOUNDER"],
  },
]

export default function ExploreStartups() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-300 mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-[40px] font-semibold text-gray-900 mb-2">
            Explore startups raising now
          </h2>
          <p className="text-gray-500">
            Backed by top VCs and notable angels
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {startups.map((s, i) => (
            <motion.div
              whileHover={{ y: -6 }}
              key={i}
              className="rounded-xl border border-gray-100 shadow-sm bg-white overflow-hidden"
            >
              {/* Image */}
              <div className="relative h-45">
                <img
                  src={s.image}
                  className="object-cover w-full h-full"
                  alt=""
                />

                {/* Tag */}
                <span className="absolute top-3 left-3 bg-[#FF5A5F] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {s.tag}
                </span>

                {/* Avatar bubble */}
                <div className="absolute -bottom-4 right-4 w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-300" />
              </div>

              {/* Body */}
              <div className="pt-6 p-4">
                <p className="text-xs text-gray-500 mb-1">{s.name}</p>
                <h3 className="font-semibold text-gray-900 leading-snug mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {s.desc}
                </p>

                {/* Chips */}
                <div className="flex flex-wrap gap-2">
                  {s.chips.map((c, j) => (
                    <span
                      key={j}
                      className="text-[10px] font-semibold px-2 py-0.75 rounded bg-gray-100 text-gray-600"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex justify-center mt-14">
          <button className="bg-[#0F172A] text-white px-10 py-3 rounded-md text-sm font-semibold">
            Explore Startups
          </button>
        </div>
      </div>
    </section>
  )
}
