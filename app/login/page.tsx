"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Building2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { login } from "@/lib/auth" // Importa a Server Action de login para empresas
import { BrasaoAcre } from "@/components/LogoIndustria"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await login(email, password) // Chama a Server Action de login para empresas
      if (result.success) {
        router.push("/dashboard") // Redireciona para o dashboard da empresa
      } else {
        setError(result.message)
      }
    } catch (err) {
      console.error("Erro no login:", err)
      setError("Ocorreu um erro inesperado durante o login.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <BrasaoAcre className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Entrar como Empresa</CardTitle>
          <CardDescription>Acesse sua conta para gerenciar sua empresa.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seuemail@exemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <Link href="/recuperar-senha" className="text-green-600 hover:underline">
              Esqueceu sua senha?
            </Link>
          </div>
          <div className="mt-2 text-center text-sm">
            Não tem uma conta?{" "}
            <Link href="/cadastro" className="text-green-600 hover:underline">
              Cadastre-se
            </Link>
          </div>
          <div className="mt-4 text-center text-sm">
            <Link href="/admin/login" className="text-blue-600 hover:underline">
              Login de Administrador
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
