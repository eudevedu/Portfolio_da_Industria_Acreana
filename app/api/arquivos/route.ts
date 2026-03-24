import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { criarArquivo, buscarArquivosPorEmpresa, deletarArquivo } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    console.log("API Arquivos - User session:", user ? { id: user.id, empresa_id: user.empresa_id, tipo: user.tipo } : "No user")
    
    if (!user || user.tipo !== "empresa") {
      return NextResponse.json(
        { success: false, error: "Acesso negado" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { nome, url, tipo, categoria, empresa_id: bodyEmpresaId } = body
    
    // Usar empresa_id da sessão, ou do body se for admin (mas aqui só permitimos empresa)
    const targetEmpresaId = user.empresa_id || bodyEmpresaId

    if (!nome || !url) {
      return NextResponse.json(
        { success: false, error: "Nome e URL são obrigatórios" },
        { status: 400 }
      )
    }
    
    if (!targetEmpresaId) {
      console.warn("API Arquivos - empresa_id não encontrado na sessão ou no corpo.")
      return NextResponse.json(
        { success: false, error: "ID da empresa não identificado. Tente fazer login novamente." },
        { status: 400 }
      )
    }

    const { data, error } = await criarArquivo({
      empresa_id: targetEmpresaId,
      nome,
      url,
      tipo: tipo || 'pdf',
      categoria: categoria || 'documento'
    })

    if (error || !data) {
      console.error("Erro ao criar arquivo na API:", error)
      return NextResponse.json(
        { 
          success: false, 
          error: error?.message || "Erro ao criar arquivo no banco de dados",
          details: error 
        },
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

    const data = await buscarArquivosPorEmpresa(user.empresa_id!)

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

    await deletarArquivo(id)

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
