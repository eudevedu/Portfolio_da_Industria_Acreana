import { NextResponse } from "next/server"
import { isAdmin } from "@/lib/auth"
import { buscarEmpresas, criarEmpresa } from "@/lib/services/empresa-service"
import { empresaSchema } from "@/lib/schemas/empresa-schema"

/**
 * GET: Listagem completa de empresas para Admin
 */
export async function GET(request: Request) {
  try {
    const isAuthorized = await isAdmin()
    if (!isAuthorized) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const filters = {
      status: searchParams.get("status") || "all",
      setor_economico: searchParams.get("setor_economico") || "all",
      municipio: searchParams.get("municipio") || "all",
      busca: searchParams.get("busca") || "",
    }

    const empresas = await buscarEmpresas(filters)
    return NextResponse.json({ success: true, empresas })
  } catch (error) {
    console.error("Admin List Companies API Error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

/**
 * POST: Criação de nova empresa por Admin (sem auth vinculada)
 */
export async function POST(request: Request) {
  try {
    const isAuthorized = await isAdmin()
    if (!isAuthorized) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const body = await request.json()
    
    // Validação rigorosa via Zod
    const validation = empresaSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Dados inválidos", 
        details: validation.error.flatten().fieldErrors 
      }, { status: 400 })
    }

    // Proteção contra Mass Assignment: passamos apenas os campos validados
    const { status, ...dadosEmpresa } = validation.data
    const novaEmpresa = await criarEmpresa({
      ...dadosEmpresa
    })

    return NextResponse.json({ success: true, empresa: novaEmpresa }, { status: 201 })
  } catch (error: any) {
    console.error("Admin Create Company API Error:", error)
    return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 })
  }
}
