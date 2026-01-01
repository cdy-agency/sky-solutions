"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "./auth-context"
import { canAccessPage, getRoleBasePath } from "./role-guard"

export function useRoleGuard() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return

    // If not authenticated and trying to access protected routes
    if (!user) {
      const publicPages = ["/", "/login", "/register", "/verify"]
      const isPublic = publicPages.some((page) => pathname.startsWith(page))
      if (!isPublic) {
        router.push("/login")
      }
      return
    }

    // If authenticated but accessing wrong role's pages
    if (!canAccessPage(user.role, pathname)) {
      const basePath = getRoleBasePath(user.role)
      router.push(basePath)
    }
  }, [user, pathname, isLoading, router])

  return { canAccess: canAccessPage(user?.role, pathname), isLoading }
}
