"use client"
import { EmpresaDashboard } from "../app/dashboard/EmpresaDashboard"
import type { Empresa } from "../lib/supabase.types"

export default function EmpresaDashboardWrapper({ empresa }: { empresa: Empresa }) {
  // Aqui você pode passar funções como props normalmente
  return <EmpresaDashboard empresa={empresa} onAtualizado={() => window.location.reload()} />
}