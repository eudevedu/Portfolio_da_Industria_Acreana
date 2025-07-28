'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lock, Trash2, User, Mail, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ConfiguracoesEmpresaProps {
  userEmail: string
  empresaId: string
}

export default function ConfiguracoesEmpresa({ userEmail, empresaId }: ConfiguracoesEmpresaProps) {
  const [email, setEmail] = useState(userEmail)
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const router = useRouter()

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/update-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail: email })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Email atualizado com sucesso!' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao atualizar email' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro interno do servidor' })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (novaSenha !== confirmarSenha) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' })
      setLoading(false)
      return
    }

    if (novaSenha.length < 6) {
      setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres' })
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currentPassword: senhaAtual,
          newPassword: novaSenha 
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Senha atualizada com sucesso!' })
        setSenhaAtual('')
        setNovaSenha('')
        setConfirmarSenha('')
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao atualizar senha' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro interno do servidor' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeletingAccount(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Conta excluída com sucesso. Redirecionando...' })
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao excluir conta' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro interno do servidor' })
    } finally {
      setDeletingAccount(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Mensagens de feedback */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Alterar Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Alterar Email
          </CardTitle>
          <CardDescription>
            Atualize o email associado à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateEmail} className="space-y-4">
            <div>
              <Label htmlFor="email">Novo Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu-novo-email@exemplo.com"
                required
              />
            </div>
            <Button type="submit" disabled={loading || email === userEmail}>
              {loading ? 'Atualizando...' : 'Atualizar Email'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Alterar Senha */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Alterar Senha
          </CardTitle>
          <CardDescription>
            Mantenha sua conta segura com uma senha forte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <Label htmlFor="senhaAtual">Senha Atual</Label>
              <Input
                id="senhaAtual"
                type="password"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                placeholder="Digite sua senha atual"
                required
                autoComplete="current-password"
              />
            </div>
            <div>
              <Label htmlFor="novaSenha">Nova Senha</Label>
              <Input
                id="novaSenha"
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Digite a nova senha (mín. 6 caracteres)"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
              <Input
                id="confirmarSenha"
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Confirme a nova senha"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Atualizando...' : 'Atualizar Senha'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Excluir Conta */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Zona de Perigo
          </CardTitle>
          <CardDescription className="text-red-600">
            Ações irreversíveis que afetam permanentemente sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Excluir Conta</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Esta ação excluirá permanentemente sua conta, todos os dados da empresa, 
                    produtos, arquivos e histórico. Esta ação não pode ser desfeita.
                  </p>
                </div>
              </div>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deletingAccount}>
                  {deletingAccount ? 'Excluindo...' : 'Excluir Conta Permanentemente'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div>Esta ação excluirá permanentemente sua conta e todos os dados associados:</div>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Informações da empresa</li>
                        <li>Todos os produtos cadastrados</li>
                        <li>Todos os arquivos e imagens</li>
                        <li>Histórico de atividades</li>
                        <li>Dados de autenticação</li>
                      </ul>
                      <div className="font-medium text-red-600">
                        Esta ação NÃO PODE ser desfeita.
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Sim, excluir permanentemente
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
