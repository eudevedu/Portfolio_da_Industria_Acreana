"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Building2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase"
import { resetPassword } from "@/lib/auth"
import Link from "next/link"

function RedefinirSenhaContent() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkRecoverySession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          setReady(true)
        } else {
          // Aguarda um pouco para o caso de o token estar sendo processado
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession()
            if (!retrySession) {
              setError("Sessão de recuperação não encontrada ou expirada.")
            }
            setReady(true)
          }, 1500)
        }
      } catch (err) {
        setError("Erro ao validar sessão de recuperação.")
        setReady(true)
      }
    }
    checkRecoverySession()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (newPassword !== confirmNewPassword) {
      setError("As senhas não coincidem.")
      setLoading(false)
      return
    }

    const result = await resetPassword(newPassword)
    
    if (result.success) {
      setSuccess(result.message)
      setTimeout(() => router.push("/login"), 3000)
    } else {
      setError(result.message)
    }
    setLoading(false)
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-none rounded-[2rem]">
        <CardHeader className="text-center p-8 bg-slate-900 text-white rounded-t-[2rem]">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Nova Senha</CardTitle>
          <CardDescription className="text-slate-400">Defina sua nova senha de acesso.</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                required
                minLength={6}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 rounded-lg bg-green-50 text-green-600 text-sm">
                {success}
              </div>
            )}

            <Button type="submit" className="w-full h-12 rounded-xl font-bold" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Redefinir Senha
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <Link href="/login" className="text-primary hover:underline font-medium">
              Voltar para o Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <RedefinirSenhaContent />
    </Suspense>
  )
}
