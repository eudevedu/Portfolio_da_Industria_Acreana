"use client"

import { useFormContext, Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UploadComponent } from "@/components/upload-component"
import { CadastroFormData } from "@/lib/schemas/cadastro-schema"
import { X, FileText, Plus } from "lucide-react"
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
  const folderUrl = watch("empresa.folder_apresentacao_url")
  const outrosArquivos = watch("empresa.outros_arquivos_urls") || []

  return (
    <div className="space-y-8 mt-6">
      {/* Dados Básicos */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Label>Identidade Visual</Label>
          <UploadComponent
            onUploadSuccess={(url) => setValue("empresa.logo_url", url, { shouldValidate: true })}
            currentUrl={logoUrl}
            acceptedFileTypes="image/*"
            buttonText={logoUrl ? "Alterar Logo" : "Logo da Empresa (1MB)"}
          />
        </div>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome_fantasia">Nome Fantasia *</Label>
            <Input id="nome_fantasia" {...register("empresa.nome_fantasia")} placeholder="Nome como é conhecida" />
            {errors.empresa?.nome_fantasia && (
              <p className="text-red-500 text-[10px] font-bold">{errors.empresa.nome_fantasia.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="razao_social">Razão Social *</Label>
            <Input id="razao_social" {...register("empresa.razao_social")} placeholder="Nome legal da empresa" />
            {errors.empresa?.razao_social && (
              <p className="text-red-500 text-[10px] font-bold">{errors.empresa.razao_social.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ *</Label>
          <Input 
            id="cnpj" 
            {...register("empresa.cnpj")} 
            placeholder="00.000.000/0000-00" 
            onChange={(e) => {
              const { formatCnpj } = require("@/lib/cnpj-mask")
              setValue("empresa.cnpj", formatCnpj(e.target.value), { shouldValidate: true })
            }}
          />
          {errors.empresa?.cnpj && (
            <p className="text-red-500 text-[10px] font-bold">{errors.empresa.cnpj.message}</p>
          )}
        </div>

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
            <p className="text-red-500 text-[10px] font-bold text-xs">{errors.empresa.setor_economico.message}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
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
        </div>
        <div className="grid grid-cols-2 gap-4">
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
             <Label htmlFor="endereco">Endereço *</Label>
             <Input id="endereco" {...register("empresa.endereco")} placeholder="Rua, Número, Bairro" />
           </div>
        </div>
      </div>

      <div className="space-y-4">
        <Label htmlFor="apresentacao">Apresentação da Indústria *</Label>
        <Textarea 
          id="apresentacao" 
          {...register("empresa.apresentacao")} 
          placeholder="Conte sobre a história, missão e valores da sua indústria..."
          className="min-h-[120px]"
        />
      </div>

      {/* Documentos Institucionais */}
      <div className="grid md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
        <div className="space-y-2">
          <Label>Folder de Apresentação (PDF)</Label>
          <UploadComponent
            onUploadSuccess={(url) => setValue("empresa.folder_apresentacao_url", url)}
            currentUrl={folderUrl || ""}
            acceptedFileTypes="application/pdf"
            buttonText="Upload PDF (Máx 5MB)"
          />
        </div>
        <div className="space-y-2">
          <Label>Outros Documentos Importantes</Label>
          <div className="space-y-2">
             <UploadComponent
               onUploadSuccess={(url) => {
                 if (url) setValue("empresa.outros_arquivos_urls", [...outrosArquivos, url])
               }}
               autoReset={true}
               acceptedFileTypes="application/pdf,image/*"
               buttonText="Adicionar Arquivo"
             />
             <div className="flex flex-wrap gap-2">
                {outrosArquivos.map((url, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white border rounded-full px-3 py-1 text-[10px] font-bold">
                    <FileText className="h-3 w-3 text-red-500" />
                    <span className="truncate max-w-[80px]">{url.split('/').pop()}</span>
                    <button type="button" onClick={() => setValue("empresa.outros_arquivos_urls", outrosArquivos.filter((_, idx) => idx !== i))}>
                      <X className="h-3 w-3 text-slate-400 hover:text-red-500" />
                    </button>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
