"use client"

import { useState, useEffect } from "react"

interface User {
  id: string
  email: string
  tipo: "admin" | "empresa"
  empresa_id?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Função para verificar o status de login no client
    const checkAuthStatus = async () => {
      try {
        // Faz uma requisição para uma API que verifica o cookie
        const response = await fetch('/api/auth/status', {
          method: 'GET',
          credentials: 'include', // Inclui cookies
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            setUser(data.user)
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status de auth:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  return { user, loading, isLoggedIn: !!user }
}
