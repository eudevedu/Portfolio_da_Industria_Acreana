import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST() {
  try {
    if (!supabase) {
      return NextResponse.json({ error: "Supabase não configurado" }, { status: 500 })
    }

    // Adicionar logo de exemplo para a empresa 1
    const { data, error } = await supabase
      .from('empresas')
      .update({ 
        logo_url: 'https://via.placeholder.com/100x100/10B981/FFFFFF?text=LOGO' 
      })
      .eq('id', '1')
      .select()

    if (error) {
      console.error("Erro ao adicionar logo:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Logo adicionada com sucesso",
      data 
    })

  } catch (error) {
    console.error("Erro na API:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
