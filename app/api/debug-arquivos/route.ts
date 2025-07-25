import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const empresaId = searchParams.get('empresa_id') || 'fcbde269-fc75-4664-a0c8-4c0d6380929b' // SEICT ID
    
    console.log("🔍 Debug Arquivos - Buscando arquivos para empresa:", empresaId)
    
    // Buscar arquivos diretamente da tabela
    const { data: arquivos, error: arquivosError } = await supabase!
      .from('arquivos')
      .select('*')
      .eq('empresa_id', empresaId)
    
    if (arquivosError) {
      console.error("❌ Erro ao buscar arquivos:", arquivosError)
    } else {
      console.log(`✅ Arquivos encontrados: ${arquivos?.length || 0}`)
      arquivos?.forEach((arquivo, index) => {
        console.log(`Arquivo ${index + 1}:`, {
          id: arquivo.id,
          nome: arquivo.nome,
          nome_original: arquivo.nome_original,
          url: arquivo.url,
          tipo: arquivo.tipo,
          categoria: arquivo.categoria
        })
      })
    }
    
    // Buscar empresa com arquivos relacionados
    const { data: empresa, error: empresaError } = await supabase!
      .from('empresas')
      .select('*, arquivos(*)')
      .eq('id', empresaId)
      .single()
      
    if (empresaError) {
      console.error("❌ Erro ao buscar empresa com arquivos:", empresaError)
    } else {
      console.log("✅ Empresa encontrada:", {
        id: empresa.id,
        nome: empresa.nome_fantasia,
        arquivos_count: empresa.arquivos?.length || 0
      })
    }
    
    return NextResponse.json({
      success: true,
      empresa_id: empresaId,
      arquivos_direto: arquivos || [],
      empresa_com_arquivos: empresa || null,
      arquivos_count_direto: arquivos?.length || 0,
      arquivos_count_relacionado: empresa?.arquivos?.length || 0
    })
    
  } catch (error) {
    console.error("❌ Erro na API de debug arquivos:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    )
  }
}
