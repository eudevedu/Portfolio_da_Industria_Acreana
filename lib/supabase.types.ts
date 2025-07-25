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
  logo_url?: string
  instagram?: string
  facebook?: string
  youtube?: string
  linkedin?: string
  twitter?: string
  video_apresentacao?: string
  status: "pendente" | "ativo" | "inativo"
  created_at: string
  updated_at: string
  produtos: Produto[] // Relação para produtos (remova o ? para garantir sempre um array)
  arquivos: Arquivo[] // Relação para arquivos (remova o ? para garantir sempre um array)
  perfil_empresa?: PerfilEmpresa[] // Relação para perfis de contato
}

export interface Produto {
  id: string
  empresa_id: string
  nome: string
  nome_tecnico?: string
  linha?: string
  descricao?: string
  status: string
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

export interface PerfilEmpresa {
  id: string
  empresa_id: string | null
  nome_contato: string
  email: string
  telefone?: string
  cargo?: string
  created_at: string
  updated_at: string
}

export type Admin = {
  id: string
  nome: string
  email: string
  cargo?: string
  ativo: boolean
  created_at: string
  updated_at: string
}


