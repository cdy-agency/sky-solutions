"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300
        ${scrolled ? "bg-white/90 backdrop-blur-xl shadow-sm" : "bg-transparent"}
      `}
    >
      <div className="max-w-330 mx-auto px-6">
        <div className="flex h-16 items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-10">
            <Link href="/" className="text-[17px] font-semibold tracking-tight text-[#3B82F6]">
              SKY SOLUTION
            </Link>

            <div className="hidden md:flex items-center gap-7 text-[14px] text-gray-600">
              <Link href="#" className="hover:text-gray-900">Discover Projects</Link>
              <Link href="#" className="hover:text-gray-900">Pre-IPO & Funds</Link>
            </div>
          </div>

          {/* CENTER SEARCH */}
          <div className="hidden lg:flex items-center">
            <div className="flex items-center gap-2 px-4 h-9 rounded-full bg-white/70 border border-gray-200 shadow-sm">
              <span className="text-gray-400 text-[13px]">Search</span>
              <span className="text-gray-400 text-xs border px-1.5 rounded">/</span>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-6 text-[14px] text-gray-600">
            <Link href="#" className="hover:text-gray-900">Raise Money</Link>
            <Link href="#" className="hover:text-gray-900">Learn</Link>
            <Link href="#" className="hover:text-gray-900">Log in</Link>
            <Link
              href="#"
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-800 font-medium hover:bg-gray-50"
            >
              Sign up
            </Link>
          </div>

        </div>
      </div>

      {/* bottom glass border */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-gray-300/40 to-transparent" />
    </nav>
  )
}
