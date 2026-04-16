"use client"

import { useFormContext, Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UploadComponent } from "@/components/upload-component"
import { CadastroFormData } from "@/lib/schemas/cadastro-schema"
import { X, AlertCircle } from "lucide-react"
import { formatCnpj } from "@/lib/cnpj-mask"

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
          <Input 
            id="nome_fantasia" 
            {...register("empresa.nome_fantasia")} 
            className={`rounded-xl ${errors.empresa?.nome_fantasia ? "border-red-500 bg-red-50" : ""}`} 
          />
          {errors.empresa?.nome_fantasia && (
            <p className="text-red-500 text-[10px] font-bold flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.empresa.nome_fantasia.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="razao_social">Razão Social *</Label>
          <Input 
            id="razao_social" 
            {...register("empresa.razao_social")} 
            className={`rounded-xl ${errors.empresa?.razao_social ? "border-red-500 bg-red-50" : ""}`} 
          />
          {errors.empresa?.razao_social && (
            <p className="text-red-500 text-[10px] font-bold flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.empresa.razao_social.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 items-end">
        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ *</Label>
          <Input 
            id="cnpj" 
            {...register("empresa.cnpj")} 
            placeholder="00.000.000/0000-00" 
            className={`rounded-xl ${errors.empresa?.cnpj ? "border-red-500 bg-red-50" : ""}`}
            onChange={(e) => {
              const masked = formatCnpj(e.target.value)
              setValue("empresa.cnpj", masked, { shouldValidate: true })
            }}
          />
          {errors.empresa?.cnpj && (
            <p className="text-red-500 text-[10px] font-bold flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.empresa.cnpj.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Logo da Empresa</Label>
          <UploadComponent
            onUploadSuccess={(url) => setValue("empresa.logo_url", url)}
            currentUrl={logoUrl}
            acceptedFileTypes="image/*"
            buttonText={logoUrl ? "Alterar Logo" : "Clique para subir a Logo"}
            className="w-full"
          />
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
                <SelectTrigger className={`rounded-xl ${errors.empresa?.setor_economico ? "border-red-500 bg-red-50" : ""}`}>
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
            <p className="text-red-500 text-[10px] font-bold flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.empresa.setor_economico.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Atividade Principal *</Label>
          <Controller
            name="empresa.setor_empresa"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className={`rounded-xl ${errors.empresa?.setor_empresa ? "border-red-500 bg-red-50" : ""}`}>
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
            <p className="text-red-500 text-[10px] font-bold flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.empresa.setor_empresa.message}
            </p>
          )}
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
          className={`rounded-xl resize-none ${errors.empresa?.descricao_produtos ? "border-red-500 bg-red-50" : ""}`}
        />
        {errors.empresa?.descricao_produtos && (
          <p className="text-red-500 text-[10px] font-bold flex items-center gap-1 mt-1">
            <AlertCircle className="h-3 w-3" /> {errors.empresa.descricao_produtos.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="apresentacao">Texto de Apresentação *</Label>
        <Textarea 
          id="apresentacao" 
          {...register("empresa.apresentacao")} 
          placeholder="Breve texto de apresentação..."
          className={`rounded-xl min-h-[100px] resize-none ${errors.empresa?.apresentacao ? "border-red-500 bg-red-50" : ""}`}
        />
        {errors.empresa?.apresentacao && (
          <p className="text-red-500 text-[10px] font-bold flex items-center gap-1 mt-1">
            <AlertCircle className="h-3 w-3" /> {errors.empresa.apresentacao.message}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="endereco">Endereço Completo *</Label>
          <Textarea 
             id="endereco" 
             {...register("empresa.endereco")} 
             placeholder="Rua, número, bairro..."
             className={`rounded-xl min-h-[80px] resize-none ${errors.empresa?.endereco ? "border-red-500 bg-red-50" : ""}`}
          />
          {errors.empresa?.endereco && (
            <p className="text-red-500 text-[10px] font-bold flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" /> {errors.empresa.endereco.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Município *</Label>
          <Controller
            name="empresa.municipio"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className={`rounded-xl ${errors.empresa?.municipio ? "border-red-500 bg-red-50" : ""}`}>
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
          {errors.empresa?.municipio && (
            <p className="text-red-500 text-[10px] font-bold flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" /> {errors.empresa.municipio.message}
            </p>
          )}
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
