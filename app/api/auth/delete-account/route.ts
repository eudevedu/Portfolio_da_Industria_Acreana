import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, logout } from "@/lib/auth"
import { createServerSideClient, createAdminClient } from "@/lib/supabase"

export const dynamic = 'force-dynamic'

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (user.tipo !== "empresa") {
      return NextResponse.json({ error: "Ação não permitida" }, { status: 403 })
    }

    const empresaId = user.empresa_id
    if (!empresaId) return NextResponse.json({ error: "Empresa não vinculada" }, { status: 400 })

    const supabase = await createServerSideClient()
    const adminClient = createAdminClient() // Necessário para deletar usuário do Auth

    // 1. Excluir dados relacionados (RLS deve estar configurado, mas limpamos manualmente para garantir)
    await Promise.all([
      supabase.from('analytics').delete().eq('empresa_id', empresaId),
      supabase.from('perfis_empresas').delete().eq('empresa_id', empresaId),
      supabase.from('arquivos').delete().eq('empresa_id', empresaId),
      supabase.from('produtos').delete().eq('empresa_id', empresaId),
    ])
    
    // 2. Excluir empresa
    const { error: empresaError } = await supabase.from('empresas').delete().eq('id', empresaId)
    if (empresaError) throw empresaError

    // 3. Excluir conta no Supabase Auth (Service Role necessária)
    const { error: authError } = await adminClient.auth.admin.deleteUser(user.id)
    if (authError) {
       console.error("Erro ao deletar usuário do Auth:", authError)
       // Mesmo se o Auth falhar, os dados já foram limpos. Mas reportamos o erro.
    }

    // O logout irá limpar os cookies de sessão do Supabase
    await logout()

    return NextResponse.json({
      success: true,
      message: "Conta e dados excluídos com sucesso"
    })

  } catch (error: any) {
    console.error("Delete Account API Error:", error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Erro interno do servidor" 
    }, { status: 500 })
  }
}
