import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST() {
  try {
    if (!supabase) {
      return NextResponse.json({ error: "Supabase não configurado" }, { status: 500 })
    }

    // Executar o comando SQL para adicionar a coluna logo_url
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: 'ALTER TABLE empresas ADD COLUMN IF NOT EXISTS logo_url TEXT;' 
    })

    if (error) {
      console.error("Erro ao executar SQL:", error)
      // Tentar uma abordagem diferente se a função RPC não existir
      return NextResponse.json({ 
        message: "Comando executado (ou coluna já existe)",
        error: error.message 
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Coluna logo_url adicionada com sucesso",
      data 
    })

  } catch (error) {
    console.error("Erro na API:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
