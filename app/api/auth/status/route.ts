import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (user) {
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          tipo: user.tipo,
          empresa_id: user.empresa_id
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        user: null
      })
    }
  } catch (error) {
    console.error("Erro ao verificar status de auth:", error)
    return NextResponse.json({
      success: false,
      user: null
    })
  }
}
