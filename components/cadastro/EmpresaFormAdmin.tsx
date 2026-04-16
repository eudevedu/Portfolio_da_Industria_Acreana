"use client"

import { useFormContext, Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UploadComponent } from "@/components/upload-component"
import { CadastroFormData } from "@/lib/schemas/cadastro-schema"
import { X } from "lucide-react"

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

export function EmpresaFormAdmin() {
  const { register, control, setValue, watch, formState: { errors } } = useFormContext<CadastroFormData>()
  const logoUrl = watch("empresa.logo_url")

  return (
    <div className="space-y-6 mt-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome_fantasia">Nome Fantasia *</Label>
          <Input id="nome_fantasia" {...register("empresa.nome_fantasia")} className="rounded-xl" />
          {errors.empresa?.nome_fantasia && (
            <p className="text-red-500 text-xs">{errors.empresa.nome_fantasia.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="razao_social">Razão Social *</Label>
          <Input id="razao_social" {...register("empresa.razao_social")} className="rounded-xl" />
          {errors.empresa?.razao_social && (
            <p className="text-red-500 text-xs">{errors.empresa.razao_social.message}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 items-end">
        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ *</Label>
          <Input id="cnpj" {...register("empresa.cnpj")} placeholder="00.000.000/0000-00" className="rounded-xl" />
          {errors.empresa?.cnpj && (
            <p className="text-red-500 text-xs">{errors.empresa.cnpj.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Logo da Empresa</Label>
          <div className="flex items-center gap-3">
            <UploadComponent
              onUploadSuccess={(url) => setValue("empresa.logo_url", url)}
              acceptedFileTypes="image/*"
              buttonText={logoUrl ? "Alterar Logo" : "Upload Logo"}
            />
            {logoUrl && (
              <div className="relative group">
                <img src={logoUrl} alt="Logo" className="w-12 h-12 rounded-xl object-contain border bg-slate-50" />
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
                <SelectTrigger className="rounded-xl">
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
        </div>

        <div className="space-y-2">
          <Label>Atividade Principal *</Label>
          <Controller
            name="empresa.setor_empresa"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="rounded-xl">
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
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Segmento da Empresa</Label>
          <Input {...register("empresa.segmento")} placeholder="Ex: Panificação, Laticínios..." className="rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label>Tema do Segmento</Label>
          <Input {...register("empresa.tema_segmento")} placeholder="Ex: Alimentos - Açai, Alimentos - Sorvetes" className="rounded-xl" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao_produtos">Descrição Geral dos Produtos *</Label>
        <Textarea 
          id="descricao_produtos" 
          {...register("empresa.descricao_produtos")} 
          placeholder="Descreva sucintamente os produtos..."
          className="rounded-xl resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="apresentacao">Texto de Apresentação *</Label>
        <Textarea 
          id="apresentacao" 
          {...register("empresa.apresentacao")} 
          placeholder="Breve texto de apresentação..."
          className="rounded-xl min-h-[100px] resize-none"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="endereco">Endereço Completo *</Label>
          <Textarea 
             id="endereco" 
             {...register("empresa.endereco")} 
             placeholder="Rua, número, bairro..."
             className="rounded-xl min-h-[80px] resize-none"
          />
        </div>
        <div className="space-y-2">
          <Label>Município *</Label>
          <Controller
            name="empresa.municipio"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Selecione o município" />
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
      </div>

      <div className="space-y-4 border-t pt-6 mt-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Arquivos Institucionais</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Folder de Apresentação (PDF)</Label>
            <UploadComponent
              onUploadSuccess={(url) => setValue("empresa.folder_apresentacao_url", url)}
              acceptedFileTypes="application/pdf"
              buttonText={watch("empresa.folder_apresentacao_url") ? "Alterar PDF" : "Upload PDF"}
            />
            {watch("empresa.folder_apresentacao_url") && (
              <p className="text-xs text-green-600 font-bold">PDF Carregado ✓</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Outros Arquivos (Imagens/PDFs)</Label>
            <UploadComponent
              onUploadSuccess={(url) => {
                const current = watch("empresa.outros_arquivos_urls") || []
                setValue("empresa.outros_arquivos_urls", [...current, url])
              }}
              acceptedFileTypes="image/*,application/pdf"
              buttonText="Adicionar Arquivo"
            />
            {watch("empresa.outros_arquivos_urls")?.length > 0 && (
              <p className="text-xs text-slate-500">{watch("empresa.outros_arquivos_urls")?.length} arquivo(s) adicionado(s)</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
