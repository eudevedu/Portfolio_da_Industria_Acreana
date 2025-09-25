"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Building2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { resetPassword } from "@/lib/auth" // Importa a nova Server Action

export default function RedefinirSenhaPage() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Supabase automaticamente lida com o token e o tipo na URL
  // e define a sessão do usuário temporariamente para que updateUser funcione.
  // Não precisamos extrair o token manualmente aqui para `updateUser`.

  // Adicione este console.log dentro da função RedefinirSenhaPage, antes do return
  // para ver os parâmetros da URL quando a página é carregada via link de redefinição.
  // Isso ajuda a confirmar se o token está sendo passado corretamente.
  console.log("URL Search Params:", Array.from(searchParams.entries()))

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
      const result = await resetPassword(newPassword) // Chama a Server Action
      // Adicione este console.log dentro do bloco try do handleSubmit, antes do if (result.success)
      // para ver o resultado exato da Server Action resetPassword.
      console.log("Resultado da redefinição de senha:", result)
      if (result.success) {
        setSuccess(result.message)
        // Redireciona para a página de login após um pequeno atraso
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setError(result.message)
      }
    } catch (err) {
      console.error("Erro na redefinição de senha:", err)
      setError("Ocorreu um erro inesperado durante a redefinição de senha.")
    } finally {
      setLoading(false)
    }
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
