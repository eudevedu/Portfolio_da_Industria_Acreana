// lib/supabase.types.ts
export type Empresa = {
  id: string
  nome_fantasia: string
  razao_social: string
  cnpj: string
  setor_economico: string
  setor_empresa: string
  segmento?: string
  tema_segmento?: string
  municipio: string
  endereco?: string
  apresentacao?: string
  descricao_produtos?: string
  instagram?: string
  status: "pendente" | "ativo" | "inativo"
  created_at: string
  updated_at: string
  produtos?: Produto[] // Relação para produtos
  arquivos?: Arquivo[] // Relação para arquivos
}

export type Produto = {
  id: string
  empresa_id: string
  nome: string
  linha?: string
  descricao?: string
  status: "ativo" | "inativo"
  created_at: string
  updated_at: string
}

export type Arquivo = {
  id: string
  empresa_id: string
  nome: string
  url: string
  tipo: string
  categoria?: string
  created_at: string
}

export type User = {
  id: string
  email: string
  password_hash: string
  tipo: "empresa" | "admin"
  empresa_id?: string | null
  created_at: string
  updated_at: string
}

export type Analytics = {
  id: string
  empresa_id: string
  tipo_evento: string
  referencia_id?: string | null
  timestamp: string
  ip_address?: string
  user_agent?: string
}
