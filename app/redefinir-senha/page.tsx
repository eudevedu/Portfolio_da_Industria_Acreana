"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Building2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

function RedefinirSenhaContent() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkRecoverySession = async () => {
      try {
        if (!supabase) {
          setError("Serviço de autenticação indisponível.")
          setReady(true)
          return
        }
        
        // O Supabase processa automaticamente o token da URL
        // Apenas aguardamos e verificamos se há uma sessão
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        console.log("Verificando sessão:", { hasSession: !!session, error: sessionError })
        
        if (sessionError) {
          console.error("Erro ao obter sessão:", sessionError)
        }
        
        // Listener para mudanças no estado de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth state changed:", event, session?.user?.email)
          
          if (event === 'PASSWORD_RECOVERY') {
            console.log("Sessão de recuperação de senha detectada")
            setReady(true)
          } else if (event === 'SIGNED_IN' && session) {
            console.log("Usuário autenticado")
            setReady(true)
          } else if (event === 'USER_UPDATED') {
            console.log("Usuário atualizado")
          }
        })
        
        // Se já houver sessão, marcar como pronto
        if (session) {
          console.log("Sessão existente encontrada")
          setReady(true)
        } else {
          // Se não houver sessão após 2 segundos, mostrar erro
          setTimeout(() => {
            if (!ready) {
              setError("Link de recuperação inválido ou expirado. Solicite um novo link.")
              setReady(true)
            }
          }, 2000)
        }
        
        return () => {
          subscription.unsubscribe()
        }
      } catch (err) {
        console.error("Erro ao validar sessão:", err)
        setError("Erro ao validar sessão de recuperação. Tente solicitar um novo link.")
        setReady(true)
      }
    }
    checkRecoverySession()
  }, [])

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
      if (!supabase) {
        setError("Serviço de autenticação indisponível.")
        setLoading(false)
        return
      }
      
      console.log("Tentando atualizar senha...")
      const { error: resetError } = await supabase.auth.updateUser({
        password: newPassword,
      })
      
      if (resetError) {
        console.error("Erro ao atualizar senha:", resetError)
        setError(resetError.message || "Erro ao redefinir a senha.")
        setLoading(false)
        return
      }
      
      console.log("Senha atualizada com sucesso")
      setSuccess("Senha redefinida com sucesso! Redirecionando para o login...")
      
      // Fazer logout para limpar a sessão de recuperação
      await supabase.auth.signOut()
      
      // Redireciona para a página de login
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (err) {
      console.error("Erro na redefinição de senha:", err)
      setError("Ocorreu um erro inesperado durante a redefinição de senha.")
    } finally {
      setLoading(false)
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-4" />
              <p className="text-gray-600">Verificando sessão de recuperação...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Building2 className="h-12 w-12 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">Erro na Validação</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-700 mb-6">{error}</p>
            <div className="flex flex-col gap-4">
              <Link href="/recuperar-senha">
                <Button className="w-full" variant="outline">
                  Solicitar Novo Link
                </Button>
              </Link>
              <Link href="/login">
                <Button className="w-full">
                  Voltar para o Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres</p>
            </div>
            <div>
              <Label htmlFor="confirmNewPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                placeholder="********"
                required
                minLength={6}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <p className="text-sm">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                <p className="text-sm">{success}</p>
              </div>
            )}
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
            <Link href="/login" className="text-green-600 hover:underline">
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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-4" />
              <p className="text-gray-600">Carregando...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <RedefinirSenhaContent />
    </Suspense>
  )
}
