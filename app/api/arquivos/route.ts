import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.tipo !== "empresa") {
      return NextResponse.json(
        { success: false, error: "Acesso negado" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { nome, url, tipo, categoria } = body

    if (!nome || !url) {
      return NextResponse.json(
        { success: false, error: "Nome e URL são obrigatórios" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase!
      .from('arquivos')
      .insert({
        empresa_id: user.empresa_id,
        nome,
        url,
        tipo: tipo || 'pdf',
        categoria: categoria || 'documento'
      })
      .select()
      .single()

    if (error) {
      console.error("Erro ao criar arquivo:", error)
      return NextResponse.json(
        { success: false, error: "Erro ao criar arquivo" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      arquivo: data
    })

  } catch (error) {
    console.error("Erro na API de arquivos:", error)
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.tipo !== "empresa") {
      return NextResponse.json(
        { success: false, error: "Acesso negado" },
        { status: 403 }
      )
    }

    const { data, error } = await supabase!
      .from('arquivos')
      .select('*')
      .eq('empresa_id', user.empresa_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Erro ao buscar arquivos:", error)
      return NextResponse.json(
        { success: false, error: "Erro ao buscar arquivos" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      arquivos: data || []
    })

  } catch (error) {
    console.error("Erro na API de arquivos:", error)
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.tipo !== "empresa") {
      return NextResponse.json(
        { success: false, error: "Acesso negado" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID do arquivo é obrigatório" },
        { status: 400 }
      )
    }

    // Verificar se o arquivo pertence à empresa
    const { data: arquivo, error: fetchError } = await supabase!
      .from('arquivos')
      .select('empresa_id')
      .eq('id', id)
      .single()

    if (fetchError || !arquivo || arquivo.empresa_id !== user.empresa_id) {
      return NextResponse.json(
        { success: false, error: "Arquivo não encontrado ou sem permissão" },
        { status: 404 }
      )
    }

    const { error } = await supabase!
      .from('arquivos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error("Erro ao deletar arquivo:", error)
      return NextResponse.json(
        { success: false, error: "Erro ao deletar arquivo" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Arquivo deletado com sucesso"
    })

  } catch (error) {
    console.error("Erro na API de arquivos:", error)
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
