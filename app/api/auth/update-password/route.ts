import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado" },
        { status: 401 }
      )
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Senha atual e nova senha são obrigatórias" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "A nova senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      )
    }

    // Buscar a senha atual do usuário
    const { data: userData, error: fetchError } = await supabase!
      .from('usuarios')
      .select('senha')
      .eq('id', user.id)
      .single()

    if (fetchError || !userData) {
      return NextResponse.json(
        { success: false, error: "Erro ao buscar dados do usuário" },
        { status: 500 }
      )
    }

    // Verificar se a senha atual está correta
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userData.senha)
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Senha atual incorreta" },
        { status: 400 }
      )
    }

    // Criptografar a nova senha
    const saltRounds = 10
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

    // Atualizar a senha
    const { error: updateError } = await supabase!
      .from('usuarios')
      .update({ senha: hashedNewPassword })
      .eq('id', user.id)

    if (updateError) {
      console.error("Erro ao atualizar senha:", updateError)
      return NextResponse.json(
        { success: false, error: "Erro ao atualizar senha" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Senha atualizada com sucesso"
    })

  } catch (error) {
    console.error("Erro na API de atualização de senha:", error)
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
