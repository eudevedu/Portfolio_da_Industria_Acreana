import { NextResponse } from "next/server"
import { createAdminClient } from "./supabase"
import { getAuthenticatedUser } from "./auth-guards"

export async function getAdminApiClient() {
  const client = createAdminClient()
  if (!client) {
    return { client: null, response: NextResponse.json(
      { error: "Serviço administrativo não configurado" }, { status: 503 }
    ) }
  }

  const user = await getAuthenticatedUser()
  if (!user) {
    return { client: null, response: NextResponse.json(
      { error: "Usuário não autenticado" }, { status: 401 }
    ) }
  }

  const { data: admin, error } = await client.from("admins")
    .select("ativo").eq("id", user.id).single()
  if (error || !admin?.ativo) {
    return { client: null, response: NextResponse.json(
      { error: "Acesso restrito a administradores ativos" }, { status: 403 }
    ) }
  }

  return { client, response: null }
}
