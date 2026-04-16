import { NextResponse } from "next/server"
import { isAdmin } from "@/lib/auth"
import { buscarEmpresaPorId, atualizarEmpresa, excluirEmpresa } from "@/lib/services/empresa-service"
import { empresaSchema } from "@/lib/schemas/empresa-schema"

/**
 * GET: Detalhes de uma empresa específica
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthorized = await isAdmin()
    if (!isAuthorized) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const { id } = await params
    const empresa = await buscarEmpresaPorId(id)

    if (!empresa) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true, empresa })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

/**
 * PUT: Atualização de dados da empresa
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthorized = await isAdmin()
    if (!isAuthorized) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    // Validação parcial para permitir atualizações de campos específicos
    const validation = empresaSchema.partial().safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Dados inválidos", 
        details: validation.error.flatten().fieldErrors 
      }, { status: 400 })
    }

    const empresaAtualizada = await atualizarEmpresa(id, validation.data)

    if (!empresaAtualizada) {
      return NextResponse.json({ error: "Falha ao atualizar ou empresa não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true, empresa: empresaAtualizada })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

/**
 * DELETE: Remoção de empresa
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthorized = await isAdmin()
    if (!isAuthorized) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const { id } = await params
    const success = await excluirEmpresa(id)

    if (!success) {
      return NextResponse.json({ error: "Erro ao excluir ou empresa não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Empresa removida com sucesso" })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
