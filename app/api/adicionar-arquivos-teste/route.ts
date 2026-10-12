import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  return POST(request)
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Adicionando arquivos de teste...")
    
    const empresaId = new URL(request.url).searchParams.get('empresa_id')
    if (!empresaId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(empresaId)) {
      return NextResponse.json(
        { success: false, error: 'Informe um empresa_id válido para adicionar arquivos de teste' },
        { status: 400 }
      )
    }

    // Arquivos de demonstração para a empresa informada
    const arquivosTeste = [
      {
        empresa_id: empresaId,
        nome: 'Catálogo de Produtos — Demonstração',
        url: 'https://exemplo.com/catalogo_produtos_2025.pdf',
        tipo: 'pdf',
        categoria: 'catalogo'
      },
      {
        empresa_id: empresaId,
        nome: 'Apresentação Institucional',
        url: 'https://exemplo.com/apresentacao_institucional.pdf',
        tipo: 'pdf',
        categoria: 'apresentacao'
      },
      {
        empresa_id: empresaId,
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
      message: `${data.length} arquivos de teste adicionados para a empresa informada`,
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
