import { NextResponse } from "next/server"
import { createServerSideClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { empresa_id, tipo_evento, referencia_id, ip_address, user_agent } = await request.json()

    if (!empresa_id || !tipo_evento) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 })
    }

    const supabase = await createServerSideClient()
    
    const { error } = await supabase
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
      console.error('Analytics Error:', error)
      return NextResponse.json({ success: false }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
