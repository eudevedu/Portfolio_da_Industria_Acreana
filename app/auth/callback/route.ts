import { NextRequest, NextResponse } from "next/server"
import { createServerSideClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const supabase = await createServerSideClient()
  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(new URL("/redefinir-senha", request.url))
    }
  }
  return NextResponse.redirect(new URL("/recuperar-senha?error=link-invalido", request.url))
}
