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

import { LogoSeict } from "@/components/LogoIndustria"

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
      const result = await login(email, password)
      if (result.success) {
        // Redirecionamento dinâmico baseado no tipo de usuário
        if (result.tipo === "admin") {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
        router.refresh()
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
      <Card className="w-full max-w-md shadow-2xl border-none glass">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-8">
            <Link href="/" className="group">
              {/* Container Premium para a Logo */}
              <div className="bg-white px-8 py-4 rounded-[2.5rem] shadow-xl shadow-green-900/10 group-hover:scale-105 transition-all duration-500 border border-slate-100/50">
                <LogoSeict className="h-16 w-auto object-contain" />
              </div>
            </Link>
          </div>
          <CardTitle className="text-3xl font-display font-black tracking-tight text-slate-900 uppercase">Acesso ao Portal</CardTitle>
          <CardDescription className="text-slate-500 font-medium mt-2">
            Identifique-se para acessar o seu Painel
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seuemail@exemplo.com"
                required
                autoComplete="email"
                className="rounded-xl border-slate-200 focus:ring-green-500 focus:border-green-500 h-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-500">Senha</Label>
                <Link href="/recuperar-senha" icon-left="true" className="text-[10px] font-bold text-green-600 uppercase tracking-wider hover:text-green-700">
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="********"
                required
                autoComplete="current-password"
                className="rounded-xl border-slate-200 focus:ring-green-500 focus:border-green-500 h-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-bold text-center animate-shake">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all font-bold text-sm uppercase tracking-widest" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Autenticando...
                </>
              ) : (
                "Entrar no Sistema"
              )}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">
              <span className="bg-white px-4">Área do Usuário</span>
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-xs font-medium text-slate-500">
              Ainda não tem cadastro industrial?{" "}
              <Link href="/cadastro" className="text-green-600 font-bold hover:underline">
                Cadastre sua empresa
              </Link>
            </p>

            <div className="pt-2">
              <Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-green-600 transition-colors">
                ← Voltar para a Página Inicial
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
