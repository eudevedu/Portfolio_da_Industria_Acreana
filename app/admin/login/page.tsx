"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
<<<<<<< HEAD
import { Building2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { loginAdmin } from "@/lib/auth" // Importa a Server Action de login para admin
import { LogoPortfolio } from "@/components/LogoIndustria"
=======
>>>>>>> 790b098bbcec49c4291db6b82aec7f1defc4288c

export default function AdminLoginPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/login")
  }, [router])
  
  return (
<<<<<<< HEAD
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <LogoPortfolio className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Login de Administrador</CardTitle>
          <CardDescription>Acesse o painel administrativo.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
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
                "Entrar como Admin"
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <Link href="/login" className="text-green-600 hover:underline">
              Voltar para o Login de Empresa
            </Link>
          </div>
          <div className="mt-2 text-center text-sm">
            <Link href="/recuperar-senha" className="text-blue-600 hover:underline">
              Esqueceu sua senha?
            </Link>
          </div>
        </CardContent>
      </Card>
=======
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-pulse text-slate-400 font-medium">
        Redirecionando para o portal de acesso unificado...
      </div>
>>>>>>> 790b098bbcec49c4291db6b82aec7f1defc4288c
    </div>
  )
}
