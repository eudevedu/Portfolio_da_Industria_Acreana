import { NextResponse } from "next/server"
import { buscarProdutosPorEmpresa, criarProduto, atualizarProduto, deletarProduto } from "@/lib/database"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const empresaId = searchParams.get("empresaId")

  if (!empresaId) {
    return new NextResponse("ID da empresa é obrigatório", { status: 400 })
  }

  const produtos = await buscarProdutosPorEmpresa(empresaId)
  return NextResponse.json(produtos)
}

export async function POST(request: Request) {
  const data = await request.json()
  const novoProduto = await criarProduto(data)
  return NextResponse.json(novoProduto, { status: 201 })
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
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) {
    return new NextResponse("ID do produto é obrigatório", { status: 400 })
  }
  await deletarProduto(id)
  return new NextResponse(null, { status: 204 })
}
