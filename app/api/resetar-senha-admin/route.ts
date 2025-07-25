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
    const body = await request.json()
    const { id, novaSenha } = body

    if (!id || !novaSenha) {
      return NextResponse.json(
        { error: 'ID do administrador e nova senha são obrigatórios' },
        { status: 400 }
      )
    }

    console.log('🔑 Resetando senha do admin:', id)

    // Atualizar senha no sistema de autenticação
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      id,
      { password: novaSenha }
    )

    if (authError) {
      console.error('❌ Erro ao resetar senha:', authError)
      return NextResponse.json(
        { error: `Erro ao resetar senha: ${authError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Senha resetada com sucesso')

    return NextResponse.json({
      success: true,
      message: 'Senha resetada com sucesso'
    })

  } catch (error) {
    console.error('❌ Erro geral:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
