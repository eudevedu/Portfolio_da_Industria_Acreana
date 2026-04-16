import { NextResponse } from "next/server"
import { 
  buscarProdutosPorEmpresa, 
  criarProduto, 
  atualizarProduto, 
  deletarProduto,
  buscarProdutoPorId 
} from "@/lib/database"
import { getCurrentUser } from "@/lib/auth"

/**
 * GET: Retorna produtos da empresa do usuário logado.
 */
export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user || (!user.empresa_id && user.tipo !== 'admin')) {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 })
    }

    const empresaId = user.empresa_id!
    const produtos = await buscarProdutosPorEmpresa(empresaId)
    
    return NextResponse.json({ success: true, produtos: produtos || [] })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 })
  }
}

/**
 * POST: Cria um novo produto para a empresa do usuário.
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.tipo !== "empresa" || !user.empresa_id) {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 })
    }

    const data = await request.json()
    
    // Injeção forçada do empresa_id do token para evitar que o usuário crie produtos para outras empresas
    const produtoData = {
      ...data,
      empresa_id: user.empresa_id
    }
    
    const novoProduto = await criarProduto(produtoData)
    
    if (!novoProduto) {
      return NextResponse.json({ success: false, error: "Falha ao criar produto" }, { status: 400 })
    }
    
    return NextResponse.json({ success: true, produto: novoProduto }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 })
  }
}

/**
 * PUT: Atualiza um produto. Verifica se o produto pertence à empresa do usuário.
 */
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 })
    if (!user || !user.empresa_id) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

    // Validação de Posse (Ownership Check)
    const produtoExistente = await buscarProdutoPorId(id)
    if (!produtoExistente || produtoExistente.empresa_id !== user.empresa_id) {
      return NextResponse.json({ error: "Produto não encontrado ou sem permissão" }, { status: 404 })
    }

    const data = await request.json()
    // Removemos empresa_id do body para evitar alteração de dono
    delete data.empresa_id

    const produtoAtualizado = await atualizarProduto(id, data)
    return NextResponse.json({ success: true, produto: produtoAtualizado })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

/**
 * DELETE: Remove um produto. Verifica se o produto pertence à empresa do usuário.
 */
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 })
    if (!user || !user.empresa_id) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

    // Validação de Posse
    const produtoExistente = await buscarProdutoPorId(id)
    if (!produtoExistente || produtoExistente.empresa_id !== user.empresa_id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 404 })
    }

    await deletarProduto(id)
    return NextResponse.json({ success: true, message: "Produto removido" })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
