import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, logout } from "@/lib/auth"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function DELETE(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, error: "Serviço não disponível no momento" },
        { status: 503 }
      )
    }

    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado" },
        { status: 401 }
      )
    }

    if (user.tipo !== "empresa") {
      return NextResponse.json(
        { success: false, error: "Apenas empresas podem excluir suas contas" },
        { status: 403 }
      )
    }

    const empresaId = user.empresa_id

    // Iniciar transação - excluir dados relacionados primeiro
    
    // 1. Excluir dados de analytics
    const { error: analyticsError } = await supabase!
      .from('analytics')
      .delete()
      .eq('empresa_id', empresaId)

    if (analyticsError) {
      console.error("Erro ao excluir analytics:", analyticsError)
    }
    
    // 2. Excluir perfis de empresa
    const { error: perfilError } = await supabase!
      .from('perfis_empresas')
      .delete()
      .eq('empresa_id', empresaId)

    if (perfilError) {
      console.error("Erro ao excluir perfis de empresa:", perfilError)
    }
    
    // 3. Excluir arquivos da empresa
    const { error: arquivosError } = await supabase!
      .from('arquivos')
      .delete()
      .eq('empresa_id', empresaId)

    if (arquivosError) {
      console.error("Erro ao excluir arquivos:", arquivosError)
    }

    // 4. Excluir produtos da empresa
    const { error: produtosError } = await supabase!
      .from('produtos')
      .delete()
      .eq('empresa_id', empresaId)

    if (produtosError) {
      console.error("Erro ao excluir produtos:", produtosError)
    }

    // 5. Excluir dados da empresa
    const { error: empresaError } = await supabase!
      .from('empresas')
      .delete()
      .eq('id', empresaId)

    if (empresaError) {
      console.error("Erro ao excluir empresa:", empresaError)
      return NextResponse.json(
        { success: false, error: "Erro ao excluir dados da empresa" },
        { status: 500 }
      )
    }

    // 6. Excluir usuário
    const { error: userError } = await supabase!
      .from('usuarios')
      .delete()
      .eq('id', user.id)

    if (userError) {
      console.error("Erro ao excluir usuário:", userError)
      return NextResponse.json(
        { success: false, error: "Erro ao excluir conta de usuário" },
        { status: 500 }
      )
    }

    // 7. Limpar cookies de sessão
    const cookieStore = await cookies()
    cookieStore.delete('user_session')

    return NextResponse.json({
      success: true,
      message: "Conta excluída com sucesso"
    })

  } catch (error) {
    console.error("Erro na API de exclusão de conta:", error)
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
