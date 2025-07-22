import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      vercel: {
        url: process.env.VERCEL_URL,
        region: process.env.VERCEL_REGION,
        runtime: process.env.VERCEL_RUNTIME || 'unknown'
      },
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'CONFIGURADO' : 'NÃO CONFIGURADO',
        urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'CONFIGURADO' : 'NÃO CONFIGURADO',
        anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0
      },
      nextjs: {
        version: process.version,
        platform: process.platform,
        arch: process.arch
      }
    }

    // Teste básico de conexão com Supabase
    let supabaseTest = 'NÃO TESTADO'
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        )
        
        // Teste básico
        const { data, error } = await supabase.auth.getSession()
        supabaseTest = error ? `ERRO: ${error.message}` : 'CONECTADO'
      } else {
        supabaseTest = 'VARIÁVEIS NÃO CONFIGURADAS'
      }
    } catch (error) {
      supabaseTest = `ERRO DE IMPORTAÇÃO: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }

    return NextResponse.json({
      success: true,
      diagnostics: {
        ...diagnostics,
        supabaseConnection: supabaseTest
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      diagnostics: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        error: 'Falha no diagnóstico'
      }
    })
  }
}

// Forçar Node.js runtime se necessário
export const runtime = 'nodejs'
