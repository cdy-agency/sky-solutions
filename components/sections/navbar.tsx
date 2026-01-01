"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

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
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          
          {/* LEFT */}
          <div className="flex items-center gap-10">
             <Link href="/" className="flex items-center gap-2">
                        <Image
                          src="/images/blue-20and-20orange-20circle-20icon-20business-20logo-20-283-29.png"
                          alt="SKY Solutions Logo"
                          width={120}
                          height={40}
                          className="h-8 w-auto"
                        />
                      </Link>

            <div className="hidden md:flex items-center gap-7 text-[14px] text-gray-600">
              <Link href="/register?role=investor" className="hover:text-gray-900">
                Discover Projects
              </Link>
              <Link href="/register?role=entrepreneur" className="hover:text-gray-900">
                Raise Capital
              </Link>
            </div>
          </div>

          {/* CENTER SEARCH */}
          <div className="hidden lg:flex items-center">
            <div className="flex items-center gap-2 px-4 h-9 rounded-full bg-white/70 border border-gray-200 shadow-sm">
              <span className="text-gray-400 text-[13px]">Search</span>
              <span className="text-gray-400 text-xs border px-1.5 rounded">/</span>
            </div>
          </div>

          {/* RIGHT (DESKTOP) */}
          <div className="hidden md:flex items-center gap-6 text-[14px] text-gray-600">
            {/* <Link href="#" className="hover:text-gray-900">Raise Money</Link> */}
            {/* <Link href="#" className="hover:text-gray-900">Learn</Link> */}
            <Link href="/login" className="hover:text-gray-900">Log in</Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-800 font-medium hover:bg-gray-50"
            >
              Sign up
            </Link>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-700"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor">
              <path strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t">
          <div className="flex flex-col px-6 py-4 gap-4 text-[14px] text-gray-700">
            <Link href="/register?role=investor" onClick={() => setMenuOpen(false)}>
              Discover Projects
            </Link>
            <Link href="/register?role=entrepreneur" onClick={() => setMenuOpen(false)}>
              Raise Capital
            </Link>
            <Link href="/login" onClick={() => setMenuOpen(false)}>
              Log in
            </Link>
            <Link
              href="/register"
              onClick={() => setMenuOpen(false)}
              className="mt-2 inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50"
            >
              Sign up
            </Link>
          </div>
        </div>
      )}

      {/* bottom glass border */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-gray-300/40 to-transparent" />
    </nav>
  )
}
