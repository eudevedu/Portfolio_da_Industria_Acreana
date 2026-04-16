"use client"

import { useFormContext, Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UploadComponent } from "@/components/upload-component"
import { CadastroFormData } from "@/lib/schemas/cadastro-schema"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

const SETORES_ECONOMICOS = [
  { value: "industria", label: "Indústria" },
  { value: "agroindustria", label: "Agroindústria" },
  { value: "servicos", label: "Serviços" },
  { value: "comercio", label: "Comércio" },
]

const SETORES_EMPRESA = [
  { value: "alimentos", label: "Alimentos e Bebidas" },
  { value: "madeira", label: "Madeira e Móveis" },
  { value: "construcao", label: "Construção Civil" },
  { value: "tecnologia", label: "Tecnologia" },
  { value: "textil", label: "Têxtil" },
  { value: "outros", label: "Outros" },
]

const MUNICIPIOS = [
  "Rio Branco", "Cruzeiro do Sul", "Sena Madureira", "Feijó", "Tarauacá", 
  "Brasiléia", "Xapuri", "Senador Guiomard", "Plácido de Castro", "Manoel Urbano", 
  "Assis Brasil", "Capixaba", "Porto Acre", "Rodrigues Alves", "Marechal Thaumaturgo", 
  "Porto Walter", "Santa Rosa do Purus", "Jordão", "Acrelândia", "Bujari", 
  "Epitaciolândia", "Mâncio Lima"
].sort()

export function EmpresaForm() {
  const { register, control, setValue, watch, formState: { errors } } = useFormContext<CadastroFormData>()
  const logoUrl = watch("empresa.logo_url")

  return (
    <div className="space-y-6 mt-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome_fantasia">Nome Fantasia *</Label>
          <Input id="nome_fantasia" {...register("empresa.nome_fantasia")} />
          {errors.empresa?.nome_fantasia && (
            <p className="text-red-500 text-xs">{errors.empresa.nome_fantasia.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="razao_social">Razão Social *</Label>
          <Input id="razao_social" {...register("empresa.razao_social")} />
          {errors.empresa?.razao_social && (
            <p className="text-red-500 text-xs">{errors.empresa.razao_social.message}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ *</Label>
          <Input id="cnpj" {...register("empresa.cnpj")} placeholder="00.000.000/0000-00" />
          {errors.empresa?.cnpj && (
            <p className="text-red-500 text-xs">{errors.empresa.cnpj.message}</p>
          )}
        </div>
        <div className="space-y-2 flex flex-col justify-end">
          <Label>Logo da Empresa</Label>
          <div className="flex items-center gap-3">
            <UploadComponent
              onUploadSuccess={(url) => setValue("empresa.logo_url", url)}
              acceptedFileTypes="image/*"
              buttonText={logoUrl ? "Alterar Logo" : "Upload Logo"}
            />
            {logoUrl && (
              <div className="relative group">
                <img src={logoUrl} alt="Logo" className="w-12 h-12 rounded object-cover border" />
                <button 
                  type="button"
                  onClick={() => setValue("empresa.logo_url", "")}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Setor Econômico *</Label>
          <Controller
            name="empresa.setor_economico"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {SETORES_ECONOMICOS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.empresa?.setor_economico && (
            <p className="text-red-500 text-xs">{errors.empresa.setor_economico.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Atividade Principal *</Label>
          <Controller
            name="empresa.setor_empresa"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {SETORES_EMPRESA.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.empresa?.setor_empresa && (
            <p className="text-red-500 text-xs">{errors.empresa.setor_empresa.message}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Município *</Label>
          <Controller
            name="empresa.municipio"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {MUNICIPIOS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endereco">Endereço Completo *</Label>
          <Input id="endereco" {...register("empresa.endereco")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="apresentacao">Apresentação da Indústria *</Label>
        <Textarea 
          id="apresentacao" 
          {...register("empresa.apresentacao")} 
          placeholder="Conte a história e o propósito da sua empresa..."
          className="min-h-[100px]"
        />
        {errors.empresa?.apresentacao && (
          <p className="text-red-500 text-xs">{errors.empresa.apresentacao.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao_produtos">Descrição Geral dos Produtos *</Label>
        <Textarea 
          id="descricao_produtos" 
          {...register("empresa.descricao_produtos")} 
          placeholder="Ex: Fabricação de móveis planejados sob medida..."
        />
        {errors.empresa?.descricao_produtos && (
          <p className="text-red-500 text-xs">{errors.empresa.descricao_produtos.message}</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4 border-t pt-4">
        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram (Link ou @)</Label>
          <Input id="instagram" {...register("empresa.instagram")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="youtube">Vídeo de Apresentação (Link YouTube)</Label>
          <Input id="youtube" {...register("empresa.video_apresentacao")} placeholder="https://youtube.com/..." />
        </div>
      </div>
    </div>
  )
}
