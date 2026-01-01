export type UserRole = "admin" | "entrepreneur" | "investor"

export const rolePages: Record<UserRole, string[]> = {
  admin: ["/admin"],
  entrepreneur: ["/entrepreneur"],
  investor: ["/investor", "/investor/browse"],
}

export function canAccessPage(userRole: UserRole | null | undefined, pathname: string): boolean {
  if (!userRole) return false

  // Public pages accessible to all
  const publicPages = ["/", "/login", "/register", "/verify"]
  if (publicPages.some((page) => pathname.startsWith(page))) {
    return true
  }

  // Check if user's role has access to this route
  const allowedPages = rolePages[userRole]
  return allowedPages.some((page) => pathname.startsWith(page))
}

export function getRoleBasePath(role: UserRole): string {
  return rolePages[role][0]
}
