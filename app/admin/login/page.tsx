"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/login")
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-pulse text-slate-400 font-medium">
        Redirecionando para o portal de acesso unificado...
      </div>
    </div>
  )
}
