import { NextResponse } from "next/server"
import { buscarEmpresas, buscarEmpresaPorId, criarEmpresa, atualizarEmpresa, deletarEmpresa } from "@/lib/database"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  const status = searchParams.get("status") || undefined
  const setor_economico = searchParams.get("setor_economico") || undefined
  const municipio = searchParams.get("municipio") || undefined
  const busca = searchParams.get("busca") || undefined

  if (id) {
    const empresa = await buscarEmpresaPorId(id)
    if (empresa) {
      return NextResponse.json(empresa)
    }
    return new NextResponse("Empresa não encontrada", { status: 404 })
  }

  const empresas = await buscarEmpresas({ status, setor_economico, municipio, busca })
  return NextResponse.json(empresas)
}

export async function POST(request: Request) {
  const data = await request.json()
  const novaEmpresa = await criarEmpresa(data)
  return NextResponse.json(novaEmpresa, { status: 201 })
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) {
    return new NextResponse("ID da empresa é obrigatório", { status: 400 })
  }
  const data = await request.json()
  const empresaAtualizada = await atualizarEmpresa(id, data)
  if (empresaAtualizada) {
    return NextResponse.json(empresaAtualizada)
  }
  return new NextResponse("Empresa não encontrada", { status: 404 })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) {
    return new NextResponse("ID da empresa é obrigatório", { status: 400 })
  }
  await deletarEmpresa(id)
  return new NextResponse(null, { status: 204 })
}
