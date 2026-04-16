"use client"

import { useFormContext, Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UploadComponent } from "@/components/upload-component"
import { CadastroFormData } from "@/lib/schemas/cadastro-schema"
import { X, AlertCircle, PlusCircle } from "lucide-react"
import { formatCnpj } from "@/lib/cnpj-mask"
import { useState, useEffect } from "react"
import { buscarCategorias, type Categoria } from "@/lib/services/category-service"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function EmpresaFormAdmin() {
  const { register, control, setValue, watch, formState: { errors } } = useFormContext<CadastroFormData>()
  const logoUrl = watch("empresa.logo_url")
  const selectedSectorId = watch("empresa.setor_economico")

  const [allCategories, setAllCategories] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCats = async () => {
      const data = await buscarCategorias()
      setAllCategories(data || [])
      setLoading(false)
    }
    fetchCats()
  }, [])

  const setores = allCategories.filter(c => c.tipo === "setor_economico")
  const atividades = allCategories.filter(c => 
    c.tipo === "atividade_principal" && 
    (!selectedSectorId || c.parent_id === selectedSectorId || !c.parent_id)
  )

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
          <div className="flex items-center justify-between">
            <Label>Setor Econômico *</Label>
            <span className="text-[10px] text-primary font-bold flex items-center gap-1 cursor-help opacity-70 hover:opacity-100 transition-opacity">
              <PlusCircle className="h-3 w-3" /> Gerenciar Categorias no Menu
            </span>
          </div>
          <Controller
            name="empresa.setor_economico"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className={`rounded-xl ${errors.empresa?.setor_economico ? "border-red-500 bg-red-50" : ""}`}>
                  <SelectValue placeholder={loading ? "Carregando..." : "Selecione..."} />
                </SelectTrigger>
                <SelectContent>
                  {setores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
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
          <div className="flex items-center justify-between">
            <Label>Atividade Principal *</Label>
          </div>
          <Controller
            name="empresa.setor_empresa"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className={`rounded-xl ${errors.empresa?.setor_empresa ? "border-red-500 bg-red-50" : ""}`}>
                  <SelectValue placeholder={loading ? "Carregando..." : "Selecione..."} />
                </SelectTrigger>
                <SelectContent>
                  {atividades.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
                  ))}
                  {atividades.length === 0 && !loading && (
                    <p className="p-2 text-xs text-muted-foreground text-center">Nenhuma atividade para este setor</p>
                  )}
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
                  {[
                    "Rio Branco", "Cruzeiro do Sul", "Sena Madureira", "Feijó", "Tarauacá", 
                    "Brasiléia", "Xapuri", "Senador Guiomard", "Plácido de Castro", "Manoel Urbano", 
                    "Assis Brasil", "Capixaba", "Porto Acre", "Rodrigues Alves", "Marechal Thaumaturgo", 
                    "Porto Walter", "Santa Rosa do Purus", "Jordão", "Acrelândia", "Bujari", 
                    "Epitaciolândia", "Mâncio Lima"
                  ].sort().map((m) => (
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
