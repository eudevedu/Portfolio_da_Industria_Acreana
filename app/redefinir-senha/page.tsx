"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Building2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function RedefinirSenhaPage() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const access_token = searchParams.get("access_token")
    const type = searchParams.get("type")
    if (access_token && type === "recovery") {
      // Troque para o método correto da sua versão do Supabase
      if (supabase) {
        supabase.auth.exchangeCodeForSession(access_token)
          .then(({ error }) => {
            if (error) setError(error.message)
            setReady(true)
          })
          .catch((err) => {
            setError("Erro ao validar sessão de recuperação.")
            setReady(true)
          })
      } else {
        setError("Serviço de autenticação indisponível.")
        setReady(true)
      }
    } else {
      setError("Link de recuperação inválido.")
      setReady(true)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    if (newPassword.length < 6) {
      setError("A nova senha deve ter no mínimo 6 caracteres.")
      setLoading(false)
      return
    }

    if (newPassword !== confirmNewPassword) {
      setError("As senhas não coincidem.")
      setLoading(false)
      return
    }

    try {
      // Função para redefinir a senha usando Supabase
      if (!supabase) {
        setError("Serviço de autenticação indisponível.")
        setLoading(false)
        return
      }
      const { error: resetError } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (!resetError) {
        setSuccess("Senha redefinida com sucesso! Redirecionando para o login...")
        // Redireciona para a página de login após um pequeno atraso
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setError(resetError.message || "Erro ao redefinir a senha.")
      }
    } catch (err) {
      console.error("Erro na redefinição de senha:", err)
      setError("Ocorreu um erro inesperado durante a redefinição de senha.")
    } finally {
      setLoading(false)
    }
  }

  if (!ready) {
    return <div>Verificando sessão de recuperação...</div>
  }

  if (error) {
    return <div className="text-red-600">{error}</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Redefinir Senha</CardTitle>
          <CardDescription>Crie uma nova senha para sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="********"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="confirmNewPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                placeholder="********"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            {success && <p className="text-sm text-green-500 text-center">{success}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redefinindo...
                </>
              ) : (
                "Redefinir Senha"
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <Link href="/" className="text-green-600 hover:underline">
              Voltar para o Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
