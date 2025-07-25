import { NextResponse } from "next/server"
import { buscarProdutosPorEmpresa, criarProduto, atualizarProduto, deletarProduto } from "@/lib/database"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.tipo !== "empresa") {
      return NextResponse.json(
        { success: false, error: "Acesso negado" },
        { status: 403 }
      )
    }

    const produtos = await buscarProdutosPorEmpresa(user.empresa_id!)
    return NextResponse.json({
      success: true,
      produtos: produtos || []
    })
  } catch (error) {
    console.error("Erro ao buscar produtos:", error)
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.tipo !== "empresa") {
      return NextResponse.json(
        { success: false, error: "Acesso negado" },
        { status: 403 }
      )
    }

    const data = await request.json()
    
    // Adiciona o empresa_id automaticamente
    const produtoData = {
      ...data,
      empresa_id: user.empresa_id
    }
    
    const novoProduto = await criarProduto(produtoData)
    
    return NextResponse.json({
      success: true,
      produto: novoProduto
    }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar produto:", error)
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) {
    return new NextResponse("ID do produto é obrigatório", { status: 400 })
  }
  const data = await request.json()
  const produtoAtualizado = await atualizarProduto(id, data)
  if (produtoAtualizado) {
    return NextResponse.json(produtoAtualizado)
  }
  return new NextResponse("Produto não encontrado", { status: 404 })
}

export async function DELETE(request: Request) {
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
        { success: false, error: "ID do produto é obrigatório" },
        { status: 400 }
      )
    }

    // Verificar se o produto pertence à empresa
    const produtos = await buscarProdutosPorEmpresa(user.empresa_id!)
    const produto = produtos?.find(p => p.id === id)

    if (!produto) {
      return NextResponse.json(
        { success: false, error: "Produto não encontrado ou sem permissão" },
        { status: 404 }
      )
    }

    await deletarProduto(id)
    
    return NextResponse.json({
      success: true,
      message: "Produto deletado com sucesso"
    })

  } catch (error) {
    console.error("Erro ao deletar produto:", error)
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
