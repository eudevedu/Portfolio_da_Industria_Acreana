import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Forçar Node.js runtime para compatibilidade com Supabase
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('=== TESTE DE CADASTRO API ===')
    console.log('Email:', email)
    console.log('Password length:', password?.length)
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Supabase cliente configurado:', !!supabase)
    
    if (!supabase) {
      return NextResponse.json({ 
        success: false, 
        error: 'Supabase não configurado' 
      })
    }

    // Teste básico: verificar se conseguimos fazer uma query simples
    try {
      const { data: testData, error: testError } = await supabase
        .from('empresas')
        .select('id')
        .limit(1)
      
      console.log('Teste de acesso à tabela empresas:', { 
        success: !testError, 
        error: testError?.message 
      })
    } catch (tableError) {
      console.log('Erro ao acessar tabelas:', tableError)
    }

    // Agora tentar o registro
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    console.log('Resultado do signUp:')
    console.log('- User ID:', data.user?.id)
    console.log('- Session:', !!data.session)
    console.log('- Error:', error?.message)
    console.log('- Error code:', error?.code)
    console.log('- Error status:', error?.status)

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: {
          message: error.message,
          status: error.status,
          code: error.code
        }
      })
    }

    return NextResponse.json({
      success: true,
      userId: data.user?.id,
      hasSession: !!data.session
    })

  } catch (err) {
    console.error('Erro na API de teste:', err)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: err instanceof Error ? err.message : 'Erro desconhecido'
    })
  }
}
