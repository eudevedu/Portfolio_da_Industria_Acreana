'use client'

import { useEffect } from 'react'

interface AnalyticsTrackerProps {
  empresaId: string
  tipoEvento: 'visualizacao_perfil' | 'visualizacao_produto'
  referenciaId?: string
}

export default function AnalyticsTracker({ empresaId, tipoEvento, referenciaId }: AnalyticsTrackerProps) {
  useEffect(() => {
    const registrarVisualizacao = async () => {
      try {
        // Obter informações do cliente
        const ipResponse = await fetch('https://api.ipify.org?format=json')
        const { ip } = await ipResponse.json()
        
        await fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            empresa_id: empresaId,
            tipo_evento: tipoEvento,
            referencia_id: referenciaId,
            ip_address: ip,
            user_agent: navigator.userAgent,
          }),
        })
      } catch (error) {
        // Falha silenciosa - analytics não deve quebrar a experiência do usuário
        console.log('Analytics tracking failed:', error)
      }
    }

    // Registrar visualização após um pequeno delay para garantir que a página carregou
    const timer = setTimeout(registrarVisualizacao, 1000)
    
    return () => clearTimeout(timer)
  }, [empresaId, tipoEvento, referenciaId])

  // Este componente não renderiza nada visível
  return null
}
