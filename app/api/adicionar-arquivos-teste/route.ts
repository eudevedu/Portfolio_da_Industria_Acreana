import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return POST(request)
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Adicionando arquivos de teste...")
    
    // Arquivos de teste para a empresa SEICT
    const arquivosTeste = [
      {
        empresa_id: 'fcbde269-fc75-4664-a0c8-4c0d6380929b', // SEICT
        nome: 'Catálogo de Produtos SEICT 2025',
        url: 'https://exemplo.com/catalogo_produtos_2025.pdf',
        tipo: 'pdf',
        categoria: 'catalogo'
      },
      {
        empresa_id: 'fcbde269-fc75-4664-a0c8-4c0d6380929b', // SEICT
        nome: 'Apresentação Institucional',
        url: 'https://exemplo.com/apresentacao_institucional.pdf',
        tipo: 'pdf',
        categoria: 'apresentacao'
      },
      {
        empresa_id: 'fcbde269-fc75-4664-a0c8-4c0d6380929b', // SEICT
        nome: 'Certificação ISO 9001',
        url: 'https://exemplo.com/certificacao_iso_9001.pdf',
        tipo: 'pdf',
        categoria: 'certificacao'
      }
    ]
    
    // Inserir arquivos na tabela
    const { data, error } = await supabase!
      .from('arquivos')
      .insert(arquivosTeste)
      .select()
    
    if (error) {
      console.error("❌ Erro ao inserir arquivos de teste:", error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
    
    console.log(`✅ ${data.length} arquivos de teste adicionados com sucesso`)
    
    return NextResponse.json({
      success: true,
      message: `${data.length} arquivos de teste adicionados para a empresa SEICT`,
      arquivos: data
    })
    
  } catch (error) {
    console.error("❌ Erro na API de adicionar arquivos teste:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    )
  }
}
