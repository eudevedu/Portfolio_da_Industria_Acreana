"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function AuthGuard({
  children,
  requireAuth = true,
  requireAdmin = false,
  isLoggedIn,
  isAdmin,
  redirectTo = "/login",
}) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    if (requireAuth && !isLoggedIn) {
      router.push(redirectTo)
      return
    }

    if (requireAdmin && !isAdmin) {
      router.push("/")
      return
    }
  }, [mounted, isLoggedIn, isAdmin, requireAuth, requireAdmin, redirectTo, router])

  if (!mounted) {
    return null // Evita renderizar algo que pode não bater
  }

  if ((requireAuth && !isLoggedIn) || (requireAdmin && !isAdmin)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-green-500 border-t-transparent" />
      </div>
    )
  }

  return <>{children}</>
}
