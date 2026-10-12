import { z } from "zod"

export const empresaSchema = z.object({
  nome_fantasia: z.string().min(2, "Nome fantasia deve ter pelo menos 2 caracteres"),
  razao_social: z.string().min(2, "Razão social deve ter pelo menos 2 caracteres"),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/, "CNPJ inválido (00.000.000/0000-00)"),
  setor_economico: z.string().min(1, "Selecione um setor econômico"),
  setor_empresa: z.string().min(1, "Selecione a atividade principal"),
  municipio: z.string().min(1, "Selecione um município"),
  endereco: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
  apresentacao: z.string().min(10, "Apresentação deve ter pelo menos 10 caracteres"),
  descricao_produtos: z.string().min(10, "Descrição dos produtos deve ter pelo menos 10 caracteres"),
  logo_url: z.string().optional(),
  instagram: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  video_apresentacao: z.string().optional(),
  status: z.enum(["ativo", "pendente", "inativo"]).default("pendente"),
})

export type EmpresaFormData = z.infer<typeof empresaSchema>
