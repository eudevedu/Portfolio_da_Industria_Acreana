import { NextResponse } from "next/server"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { empresa_id, tipo_evento, referencia_id, ip_address, user_agent } = await request.json()

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ 
        success: true, 
        message: "Analytics simulado (Supabase não configurado)" 
      })
    }

    // Validar dados obrigatórios
    if (!empresa_id || !tipo_evento) {
      return NextResponse.json(
        { success: false, error: "empresa_id e tipo_evento são obrigatórios" },
        { status: 400 }
      )
    }

    // Inserir evento de analytics
    const { data, error } = await supabase!
      .from('analytics')
      .insert({
        empresa_id,
        tipo_evento,
        referencia_id: referencia_id || null,
        ip_address: ip_address || null,
        user_agent: user_agent || null,
        timestamp: new Date().toISOString()
      })

    if (error) {
      console.error('Erro ao registrar analytics:', error)
      return NextResponse.json(
        { success: false, error: "Erro ao registrar evento de analytics" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: "Evento de analytics registrado com sucesso",
      data 
    })

  } catch (error) {
    console.error('Erro no endpoint de analytics:', error)
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
