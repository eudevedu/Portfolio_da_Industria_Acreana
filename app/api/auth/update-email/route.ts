import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado" },
        { status: 401 }
      )
    }

    const { newEmail } = await request.json()

    if (!newEmail || !newEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: "Email inválido" },
        { status: 400 }
      )
    }

    // Verificar se o email já existe
    const { data: existingUser, error: checkError } = await supabase!
      .from('usuarios')
      .select('id')
      .eq('email', newEmail)
      .neq('id', user.id)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Este email já está em uso" },
        { status: 400 }
      )
    }

    // Atualizar o email
    const { error: updateError } = await supabase!
      .from('usuarios')
      .update({ email: newEmail })
      .eq('id', user.id)

    if (updateError) {
      console.error("Erro ao atualizar email:", updateError)
      return NextResponse.json(
        { success: false, error: "Erro ao atualizar email" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Email atualizado com sucesso"
    })

  } catch (error) {
    console.error("Erro na API de atualização de email:", error)
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
