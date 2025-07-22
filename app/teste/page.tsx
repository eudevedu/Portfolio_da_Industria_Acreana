"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function TestePage() {
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('teste@exemplo.com')
  const [password, setPassword] = useState('teste123456')

  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testCadastro = async () => {
    setLoading(true)
    setLogs([])
    
    try {
      addLog('Iniciando teste de cadastro...')
      addLog(`Email: ${email}`)
      addLog(`Senha: ${password.length} caracteres`)
      
      const response = await fetch('/api/teste-cadastro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      
      const result = await response.json()
      
      addLog(`Status da resposta: ${response.status}`)
      addLog(`Sucesso: ${result.success}`)
      
      if (result.success) {
        addLog(`✅ Cadastro bem-sucedido!`)
        addLog(`User ID: ${result.userId}`)
        addLog(`Tem sessão: ${result.hasSession}`)
      } else {
        addLog(`❌ Erro no cadastro: ${result.error}`)
        addLog(`Código do erro: ${result.code}`)
        if (result.details) {
          addLog(`Detalhes: ${JSON.stringify(result.details, null, 2)}`)
        }
      }
      
    } catch (error) {
      addLog(`❌ Erro de rede: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Diagnóstico de Cadastro Supabase</h1>
      
      <div className="grid gap-4 mb-4">
        <div>
          <Label htmlFor="email">Email de teste</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teste@exemplo.com"
          />
        </div>
        
        <div>
          <Label htmlFor="password">Senha de teste</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite uma senha"
          />
        </div>
      </div>
      
      <Button onClick={testCadastro} disabled={loading} className="mb-4">
        {loading ? 'Testando...' : 'Testar Cadastro'}
      </Button>
      
      <div className="border rounded p-4 bg-gray-50 max-h-96 overflow-y-auto">
        <h2 className="font-semibold mb-2">Logs de Diagnóstico:</h2>
        {logs.length === 0 ? (
          <p className="text-gray-500">Clique em "Testar Cadastro" para começar</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className={`text-sm font-mono mb-1 ${
              log.includes('❌') ? 'text-red-600' : 
              log.includes('✅') ? 'text-green-600' : 
              'text-gray-700'
            }`}>
              {log}
            </div>
          ))
        )}
      </div>
      
      <div className="mt-4 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold text-blue-800 mb-2">Instruções:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Este teste verifica se o Supabase Auth está funcionando</li>
          <li>• Use um email único para cada teste</li>
          <li>• Verifique os logs do terminal para mais detalhes</li>
          <li>• Se der erro "Database error saving new user", verifique a configuração do Supabase</li>
        </ul>
      </div>
    </div>
  )
}
