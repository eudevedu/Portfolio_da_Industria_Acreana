import { NextRequest, NextResponse } from "next/server"
import { buscarEmpresas } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 API Debug - Buscando todas as empresas...")
    
    // Buscar todas as empresas sem filtros
    const empresas = await buscarEmpresas({})
    
    console.log(`✅ Encontradas ${empresas.length} empresas`)
    
    // Log detalhado das empresas
    empresas.forEach((empresa, index) => {
      console.log(`Empresa ${index + 1}:`, {
        id: empresa.id,
        nome_fantasia: empresa.nome_fantasia,
        razao_social: empresa.razao_social,
        status: empresa.status,
        municipio: empresa.municipio,
        setor_economico: empresa.setor_economico
      })
    })
    
    return NextResponse.json({
      success: true,
      count: empresas.length,
      empresas: empresas.map(empresa => ({
        id: empresa.id,
        nome_fantasia: empresa.nome_fantasia,
        razao_social: empresa.razao_social,
        status: empresa.status,
        municipio: empresa.municipio,
        setor_economico: empresa.setor_economico,
        setor_empresa: empresa.setor_empresa,
        apresentacao: empresa.apresentacao?.substring(0, 100) + "..."
      }))
    })
  } catch (error) {
    console.error("❌ Erro na API de debug:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Erro desconhecido",
        details: error
      },
      { status: 500 }
    )
  }
}
