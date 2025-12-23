"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Home, Briefcase, Users, TrendingUp, LogOut, Menu, X, Building2 } from "lucide-react"
import { useState, useEffect } from "react"

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const navItems: Record<string, NavItem[]> = {
  admin: [
    { href: "/admin", label: "Dashboard", icon: <Home className="h-4 w-4" /> },
    { href: "/admin/businesses", label: "Businesses", icon: <Briefcase className="h-4 w-4" /> },
    { href: "/admin/users", label: "Users", icon: <Users className="h-4 w-4" /> },
    { href: "/admin/categories", label: "Categories", icon: <Users className="h-4 w-4" /> },
    { href: "/admin/investments", label: "Investments", icon: <TrendingUp className="h-4 w-4" /> },
  ],
  entrepreneur: [
    { href: "/entrepreneur", label: "Dashboard", icon: <Home className="h-4 w-4" /> },
    { href: "/entrepreneur/businesses", label: "My Businesses", icon: <Briefcase className="h-4 w-4" /> },
    { href: "/entrepreneur/businesses/new", label: "New Business", icon: <Building2 className="h-4 w-4" /> },
  ],
  investor: [
    { href: "/investor", label: "Dashboard", icon: <Home className="h-4 w-4" /> },
    { href: "/investor/browse", label: "Browse Businesses", icon: <Briefcase className="h-4 w-4" /> },
    { href: "/investor/investments", label: "My Investments", icon: <TrendingUp className="h-4 w-4" /> },
  ],
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const items = navItems[user.role] || []

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/blue-20and-20orange-20circle-20icon-20business-20logo-20-283-29.png"
              alt="SKY Solutions Logo"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-background border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo - Using actual logo image */}
          <div className="p-6 border-b border-border hidden lg:block">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/blue-20and-20orange-20circle-20icon-20business-20logo-20-283-29.png"
                alt="SKY Solutions Logo"
                width={160}
                height={50}
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* User Info - Using secondary (gold) accent */}
          <div className="p-4 border-b border-border mt-14 lg:mt-0 bg-secondary/10">
            <p className="font-medium text-foreground truncate">{user.name}</p>
            <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
