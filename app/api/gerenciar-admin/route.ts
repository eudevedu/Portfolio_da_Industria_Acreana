import { NextRequest, NextResponse } from 'next/server'
import { getAdminApiClient } from '@/lib/admin-api'

export async function PUT(request: NextRequest) {
  try {
    const { client: supabaseAdmin, response } = await getAdminApiClient()
    if (response) return response

    const body = await request.json()
    const { id, nome, email, cargo, ativo } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID do administrador é obrigatório' },
        { status: 400 }
      )
    }

    console.log('📝 Atualizando admin:', { id, nome, email, cargo, ativo })

    // Atualizar registro na tabela admins
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('admins')
      .update({
        nome,
        email,
        cargo,
        ativo,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (adminError) {
      console.error('❌ Erro ao atualizar administrador:', adminError)
      return NextResponse.json(
        { error: `Erro ao atualizar admin: ${adminError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Administrador atualizado com sucesso:', adminData)

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

export async function DELETE(request: NextRequest) {
  try {
    const { client: supabaseAdmin, response } = await getAdminApiClient()
    if (response) return response

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID do administrador é obrigatório' },
        { status: 400 }
      )
    }

    console.log('🗑️ Excluindo admin:', id)

    // 1. Excluir registro da tabela admins
    const { error: adminError } = await supabaseAdmin
      .from('admins')
      .delete()
      .eq('id', id)

    if (adminError) {
      console.error('❌ Erro ao excluir registro de administrador:', adminError)
      return NextResponse.json(
        { error: `Erro ao excluir admin: ${adminError.message}` },
        { status: 500 }
      )
    }

    // 2. Excluir usuário do sistema de autenticação
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)

    if (authError) {
      console.error('❌ Erro ao excluir usuário de autenticação:', authError)
      // Não retornamos erro aqui pois o registro já foi excluído da tabela
      console.warn('⚠️ Usuário de auth pode não ter sido excluído')
    }

    console.log('✅ Administrador excluído com sucesso')

    return NextResponse.json({
      success: true,
      message: 'Administrador excluído com sucesso'
    })

  } catch (error) {
    console.error('❌ Erro geral:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
