import { NextRequest, NextResponse } from 'next/server'
import { getAdminApiClient } from '@/lib/admin-api'

export async function POST(request: NextRequest) {
  try {
    const { client: supabaseAdmin, response } = await getAdminApiClient()
    if (response) return response

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
