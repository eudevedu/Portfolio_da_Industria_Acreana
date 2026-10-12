import { z } from "zod"

export const acessoSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string(),
  contactName: z.string().min(3, "Nome muito curto"),
  contactPhone: z.string().optional(),
  contactRole: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})

export const empresaSchema = z.object({
  nome_fantasia: z.string().min(2, "Nome fantasia é obrigatório"),
  razao_social: z.string().min(2, "Razão social é obrigatória"),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "CNPJ inválido (00.000.000/0000-00)"),
  setor_economico: z.string().min(1, "Selecione o setor"),
  setor_empresa: z.string().min(1, "Selecione a atividade"),
  segmento: z.string().optional(),
  tema_segmento: z.string().optional(),
  descricao_produtos: z.string().min(10, "Descreva melhor seus produtos"),
  apresentacao: z.string().min(20, "A apresentação deve ser mais detalhada"),
  endereco: z.string().min(5, "Endereço completo é obrigatório"),
  municipio: z.string().min(1, "Selecione o município"),
  logo_url: z.string().url("URL da logo inválida").optional().or(z.literal("")),
  telefone: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  youtube: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  video_apresentacao: z.string().optional(),
  folder_apresentacao_url: z.string().optional().or(z.literal("")),
  outros_arquivos_urls: z.array(z.string()).optional().default([]),
  status: z.enum(["pendente", "ativo", "inativo"]).optional().default("ativo"),
})

export const produtoSchema = z.object({
  nome: z.string().min(2, "Nome do produto é obrigatório"),
  nome_tecnico: z.string().optional(),
  linha: z.string().optional(),
  descricao: z.string().min(5, "Descrição obrigatória"),
  imagem_url: z.string().url("URL da imagem inválida").optional().or(z.literal("")),
  ficha_tecnica_url: z.string().optional().or(z.literal("")),
  folder_produto_url: z.string().optional().or(z.literal("")),
  video_produto: z.string().optional().or(z.literal("")),
  imagens_produto_urls: z.array(z.string()).optional().default([]),
})

export const cadastroCompletoSchema = z.object({
  acesso: acessoSchema,
  empresa: empresaSchema,
  produtos: z.array(produtoSchema).default([]),
})

export type CadastroFormData = z.infer<typeof cadastroCompletoSchema>
