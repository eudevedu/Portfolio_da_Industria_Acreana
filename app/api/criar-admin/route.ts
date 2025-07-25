import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Cliente administrativo usando SERVICE_ROLE_KEY
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API Route - Verificando variáveis:')
    console.log('- SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('- SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    console.log('- SERVICE_ROLE_KEY Length:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0)

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Configuração do Supabase não encontrada' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { nome, email, password, cargo } = body

    // Validações
    if (!nome || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    console.log('📝 Criando admin:', { nome, email, cargo })

    // 1. Criar usuário no sistema de autenticação do Supabase
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        tipo: 'admin',
        nome
      }
    })

    if (authError) {
      console.error('❌ Erro ao criar usuário de autenticação:', authError)
      return NextResponse.json(
        { error: `Erro na autenticação: ${authError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Usuário de auth criado:', authUser.user.id)

    // 2. Criar registro na tabela admins
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('admins')
      .insert({
        id: authUser.user.id,
        nome,
        email,
        cargo,
        ativo: true
      })
      .select()
      .single()

    if (adminError) {
      console.error('❌ Erro ao criar registro de administrador:', adminError)
      
      // Cleanup: remover usuário de auth
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      
      return NextResponse.json(
        { error: `Erro ao salvar admin: ${adminError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Administrador criado com sucesso:', adminData)

    return NextResponse.json({
      success: true,
      admin: adminData
    })

  } catch (error) {
    console.error('❌ Erro geral:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
