import { NextResponse } from "next/server"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export async function GET() {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase não configurado',
        config: {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      })
    }

    // Testar query simples
    const { data, error, count } = await supabase
      .from('empresas')
      .select('id, nome_fantasia, status, created_at', { count: 'exact' })
      .limit(5)

    return NextResponse.json({
      success: true,
      results: {
        totalEmpresas: count || 0,
        empresasEncontradas: data?.length || 0,
        empresas: data || [],
        error: error?.message || null
      },
      config: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
        environment: process.env.NODE_ENV
      }
    })

  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Erro desconhecido',
      stack: err instanceof Error ? err.stack : undefined
    }, { status: 500 })
  }
}
