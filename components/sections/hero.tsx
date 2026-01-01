"use client"

import Link from "next/link"
import HeroWall from "./HeroWall"

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F6FBFF] py-32">
      <div className="absolute inset-y-0 left-0 w-[60%] bg-linear-to-r from-[#FDE6C8] via-[#F6FBFF] to-transparent pointer-events-none" />

      <div className="relative max-w-300 mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* LEFT COPY */}
          <div className="relative z-10">
            {/* <span className="inline-flex items-center mb-6 px-4 py-1.5 text-[11px] tracking-wide font-semibold rounded-full bg-black text-white">
              NEW FOR ACCREDITED INVESTORS · Pre-IPO Startups & Insider Funds
            </span> */}

            <div className="relative inline-block">
              <div className="absolute -inset-4 bg-linear-to-r from-[#FDE6C8] to-[#E9E0FF] blur-2xl opacity-70 rounded-full" />
              <h1 className="relative text-[56px] leading-[1.05] font-medium text-gray-900">
                Invest in{" "}
                <span className="bg-linear-to-r from-[#3B82F6] to-[#A855F7] bg-clip-text text-transparent">
                  entrepreneurs
                </span>
                <br />
                building the future
              </h1>
            </div>

            <p className="mt-8 text-[17px] leading-relaxed text-gray-600 max-w-xl">
              Get equity and front row seats to the projects and small startups you
              love—for as little as $100.
            </p>

            <div className="mt-10 flex gap-4">
              <Link
                href="/register?role=investor"
                className="px-6 py-3 bg-[#2563EB] text-white text-sm font-semibold rounded-md shadow-sm hover:bg-[#2563EB]/90 transition"
              >
                Invest In the Startup
              </Link>
              <Link
                href="/register?role=entrepreneur"
                className="px-6 py-3 border border-gray-300 text-sm font-semibold rounded-md hover:bg-gray-50 transition"
              >
                Raise Capital
              </Link>
            </div>
          </div>

          {/* RIGHT WALL */}
          <HeroWall />
        </div>
      </div>
    </section>
  )
}
