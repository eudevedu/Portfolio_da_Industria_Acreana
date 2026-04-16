"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { 
  Pencil, Save, X, Loader2, Building, Globe, Phone, Mail, 
  Instagram, Facebook, Youtube, Linkedin, Twitter, MapPin, 
  FileText, Info 
} from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { UploadComponent } from "./upload-component"

import type { Empresa } from "../lib/supabase.types"
import { atualizarEmpresa } from "../lib/database"
import { formatCnpj, unformatCnpj } from "../lib/cnpj-mask"
import { buscarCategorias, type Categoria } from "../lib/services/category-service"

// Esquema de validação com Zod
const formSchema = z.object({
  nome_fantasia: z.string().min(1, "Nome Fantasia é obrigatório."),
  razao_social: z.string().min(1, "Razão Social é obrigatória."),
  cnpj: z.string().min(14, "CNPJ inválido.").max(18, "CNPJ inválido."), // 14 dígitos ou 18 com máscara
  setor_economico: z.string().min(1, "Setor Econômico é obrigatório."),
  setor_empresa: z.string().min(1, "Setor da Empresa é obrigatório."),
  municipio: z.string().min(1, "Município é obrigatório."),
  endereco: z.string().optional(),
  apresentacao: z.string().optional(),
  descricao_produtos: z.string().optional(),
  logo_url: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  youtube: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  video_apresentacao: z.string().optional(),
  telefone: z.string().optional(),
  status: z.string().optional(),
})

// Hardcoded lists removed in favor of dynamic loading from database

interface CompanyInfoCardProps {
  initialData: Empresa | null
  empresaId: string
}

export function CompanyInfoCard({ initialData, empresaId }: CompanyInfoCardProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("empresa")
  const [allCategories, setAllCategories] = React.useState<Categoria[]>([])
  const [catsLoading, setCatsLoading] = React.useState(true)

  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await buscarCategorias()
        setAllCategories(data || [])
      } catch (err) {
        console.error("Erro ao carregar categorias:", err)
      } finally {
        setCatsLoading(false)
      }
    }
    loadCategories()
  }, [])

  const selectedSectorId = form.watch("setor_economico")

  const setoresEconomicos = allCategories
    .filter(c => c.tipo === "setor_economico")
    .map(c => ({ value: c.id, label: c.nome }))

  const setoresEmpresaList = allCategories
    .filter(c => 
      c.tipo === "atividade_principal" && 
      (!selectedSectorId || c.parent_id === selectedSectorId || !c.parent_id)
    )
    .map(c => ({ value: c.id, label: c.nome }))

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_fantasia: initialData?.nome_fantasia || "",
      razao_social: initialData?.razao_social || "",
      cnpj: initialData?.cnpj ? formatCnpj(initialData.cnpj) : "",
      setor_economico: initialData?.setor_economico || "",
      setor_empresa: initialData?.setor_empresa || "",
      municipio: initialData?.municipio || "",
      endereco: initialData?.endereco || "",
      apresentacao: initialData?.apresentacao || "",
      descricao_produtos: initialData?.descricao_produtos || "",
      logo_url: initialData?.logo_url || "",
      instagram: initialData?.instagram || "",
      facebook: initialData?.facebook || "",
      youtube: initialData?.youtube || "",
      linkedin: initialData?.linkedin || "",
      twitter: initialData?.twitter || "",
      video_apresentacao: initialData?.video_apresentacao || "",
      telefone: initialData?.telefone || "",
      status: initialData?.status || "pendente",
    },
  })

  // Resetar o formulário quando initialData mudar
  React.useEffect(() => {
    if (initialData) {
      form.reset({
        nome_fantasia: initialData.nome_fantasia || "",
        razao_social: initialData.razao_social || "",
        cnpj: initialData.cnpj ? formatCnpj(initialData.cnpj) : "",
        setor_economico: initialData.setor_economico || "",
        setor_empresa: initialData.setor_empresa || "",
        municipio: initialData.municipio || "",
        endereco: initialData.endereco || "",
        apresentacao: initialData.apresentacao || "",
        descricao_produtos: initialData.descricao_produtos || "",
        logo_url: initialData.logo_url || "",
        instagram: initialData.instagram || "",
        facebook: initialData.facebook || "",
        youtube: initialData.youtube || "",
        linkedin: initialData.linkedin || "",
        twitter: initialData.twitter || "",
        video_apresentacao: initialData.video_apresentacao || "",
        telefone: initialData.telefone || "",
        status: initialData.status || "pendente",
      })
    }
  }, [initialData, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    try {
      // Removemos o status do payload de atualização pois indústrias 
      // geralmente não têm permissão para alterar seu próprio status (RLS)
      const { status, ...otherValues } = values
      
      const updatedData: Partial<Empresa> = {
        ...otherValues,
        cnpj: unformatCnpj(values.cnpj),
      }
      
      const result = await atualizarEmpresa(empresaId, updatedData)

      if (result) {
        toast.success("Informações da empresa atualizadas com sucesso!")
        setIsEditing(false)
      } else {
        toast.error("Erro ao atualizar informações. Verifique se todas as colunas existem no banco de dados.")
      }
    } catch (error) {
      console.error("Erro ao salvar:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      toast.error(`Falha ao salvar: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCnpj(e.target.value)
    form.setValue("cnpj", formattedValue, { shouldValidate: true })
  }

  const handleCancel = () => {
    form.reset() 
    setIsEditing(false)
  }

  if (!initialData && !isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const municipios = [
    { value: "Rio Branco", label: "Rio Branco" },
    { value: "Cruzeiro do Sul", label: "Cruzeiro do Sul" },
    { value: "Sena Madureira", label: "Sena Madureira" },
    { value: "Feijo", label: "Feijó" },
    { value: "Tarauaca", label: "Tarauacá" },
    { value: "Brasileia", label: "Brasiléia" },
    { value: "Xapuri", label: "Xapuri" },
    { value: "Senador Guiomard", label: "Senador Guiomard" },
    { value: "Placido de Castro", label: "Plácido de Castro" },
    { value: "Manoel Urbano", label: "Manoel Urbano" },
    { value: "Assis Brasil", label: "Assis Brasil" },
    { value: "Capixaba", label: "Capixaba" },
    { value: "Porto Acre", label: "Porto Acre" },
    { value: "Rodrigues Alves", label: "Rodrigues Alves" },
    { value: "Marechal Thaumaturgo", label: "Marechal Thaumaturgo" },
    { value: "Porto Walter", label: "Porto Walter" },
    { value: "Santa Rosa do Purus", label: "Santa Rosa do Purus" },
    { value: "Jordao", label: "Jordão" },
    { value: "Acrelandia", label: "Acrelândia" },
    { value: "Bujari", label: "Bujari" },
    { value: "Epitaciolandia", label: "Epitaciolândia" },
    { value: "Mancio Lima", label: "Mâncio Lima" },
  ]

  return (
    <Card className="glass rounded-[2rem] border-white/40 shadow-2xl overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center overflow-hidden">
            {form.getValues("logo_url") ? (
              <img src={form.getValues("logo_url")} alt="Logo" className="w-full h-full object-contain p-2" />
            ) : (
              <Building className="h-8 w-8 text-slate-300" />
            )}
          </div>
          <div>
            <CardTitle className="text-2xl font-display font-black text-slate-900 tracking-tight">
              {isEditing ? "Editar Perfil Industrial" : initialData?.nome_fantasia}
            </CardTitle>
            <CardDescription className="font-bold text-green-600 uppercase tracking-widest text-[10px]">
              {isEditing ? "Ajuste os detalhes da sua empresa" : initialData?.razao_social}
            </CardDescription>
          </div>
        </div>
        {!isEditing ? (
          <Button 
            onClick={() => setIsEditing(true)} 
            className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold gap-2 shadow-lg shadow-green-600/20"
          >
            <Pencil className="h-4 w-4" /> Editar Perfil
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel} className="rounded-xl font-bold border-slate-200">
              <X className="h-4 w-4 mr-2" /> Cancelar
            </Button>
            <Button 
              onClick={form.handleSubmit(onSubmit)} 
              disabled={isLoading}
              className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold gap-2 shadow-lg shadow-green-600/20"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar Alterações
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start rounded-none h-14 bg-white border-b border-slate-100 px-8 gap-8">
            <TabsTrigger 
              value="empresa" 
              className="rounded-none h-full border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-transparent font-bold text-[10px] uppercase tracking-widest text-slate-400 data-[state=active]:text-green-600"
            >
              Dados da Empresa
            </TabsTrigger>
            <TabsTrigger 
              value="contato" 
              className="rounded-none h-full border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-transparent font-bold text-[10px] uppercase tracking-widest text-slate-400 data-[state=active]:text-green-600"
            >
              Contato e Redes
            </TabsTrigger>
          </TabsList>

          <div className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <TabsContent value="empresa" className="mt-0 outline-none space-y-8 animate-in fade-in-50 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="nome_fantasia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nome Fantasia</FormLabel>
                          {isEditing ? (
                            <FormControl><Input {...field} className="rounded-xl border-slate-200" /></FormControl>
                          ) : (
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <Building className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-bold text-slate-700">{field.value}</span>
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="razao_social"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Razão Social</FormLabel>
                          {isEditing ? (
                            <FormControl><Input {...field} className="rounded-xl border-slate-200" /></FormControl>
                          ) : (
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <FileText className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-bold text-slate-700">{field.value}</span>
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cnpj"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CNPJ</FormLabel>
                          {isEditing ? (
                            <FormControl><Input {...field} onChange={handleCnpjChange} className="rounded-xl border-slate-200" /></FormControl>
                          ) : (
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <Info className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-bold text-slate-700">{field.value}</span>
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="setor_economico"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Setor Econômico</FormLabel>
                          {isEditing ? (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                {setoresEconomicos.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <Globe className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-bold text-slate-700">
                                {allCategories.find(c => c.id === field.value)?.nome || field.value}
                              </span>
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="setor_empresa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Setor da Empresa</FormLabel>
                          {isEditing ? (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                {setoresEmpresaList.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <Building className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-bold text-slate-700">
                                {allCategories.find(c => c.id === field.value)?.nome || field.value}
                              </span>
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="municipio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Município</FormLabel>
                          {isEditing ? (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                {municipios.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <MapPin className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-bold text-slate-700">{field.value}</span>
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</FormLabel>
                          {isEditing ? (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="ativo">Ativo</SelectItem>
                                <SelectItem value="pendente">Pendente</SelectItem>
                                <SelectItem value="inativo">Inativo</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Badge className={`font-black uppercase tracking-tighter text-[9px] px-3 py-1 rounded-full ${
                                field.value === 'ativo' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 
                                field.value === 'pendente' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' : 'bg-red-100 text-red-700 hover:bg-red-100'
                              }`}>
                                {field.value}
                              </Badge>
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="endereco"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Endereço Completo</FormLabel>
                        {isEditing ? (
                          <FormControl><Input {...field} className="rounded-xl border-slate-200" /></FormControl>
                        ) : (
                          <p className="text-sm text-slate-600 font-medium px-4 py-3 bg-white border border-slate-100 rounded-xl">{field.value || "Endereço não configurado"}</p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="apresentacao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Texto de Apresentação</FormLabel>
                          {isEditing ? (
                            <FormControl><Textarea {...field} rows={6} className="rounded-2xl border-slate-200" /></FormControl>
                          ) : (
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 text-sm text-slate-600 leading-relaxed min-h-[150px]">
                              {field.value || "Sem apresentação disponível."}
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="descricao_produtos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Linha de Produtos</FormLabel>
                          {isEditing ? (
                            <FormControl><Textarea {...field} rows={6} className="rounded-2xl border-slate-200" /></FormControl>
                          ) : (
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 text-sm text-slate-600 leading-relaxed min-h-[150px]">
                              {field.value || "Descrição de produtos não configurada."}
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {isEditing && (
                    <FormField
                      control={form.control}
                      name="logo_url"
                      render={({ field }) => (
                        <FormItem className="pt-4 border-t border-slate-100">
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Logo Marca</FormLabel>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 mt-2">
                             {field.value ? (
                               <div className="relative group w-24 h-24 bg-white rounded-xl shadow-md overflow-hidden border">
                                 <img src={field.value} className="w-full h-full object-contain p-2" />
                                 <button 
                                   onClick={() => field.onChange("")}
                                   className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                 >
                                   <X className="h-6 w-6" />
                                 </button>
                               </div>
                             ) : (
                               <div className="w-24 h-24 bg-white rounded-xl border border-slate-200 flex items-center justify-center">
                                 <Building className="h-8 w-8 text-slate-200" />
                               </div>
                             )}
                             <div className="flex-1">
                               <UploadComponent
                                 onUploadSuccess={(url) => field.onChange(url)}
                                 acceptedFileTypes="image/*"
                                 buttonText={field.value ? "Trocar Logomarca" : "Fazer Upload da Logo"}
                               />
                               <p className="text-[10px] text-slate-400 mt-3 font-medium uppercase tracking-tighter">Recomendado: PNG ou JPG, fundo transparente, proporção horizontal.</p>
                             </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </TabsContent>

                <TabsContent value="contato" className="mt-0 outline-none space-y-8 animate-in fade-in-50 duration-500">
                  <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                       <Phone className="h-4 w-4 text-green-600" /> Canais de Contato
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="telefone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Telefone Institucional</FormLabel>
                            {isEditing ? (
                              <FormControl><Input {...field} placeholder="(XX) XXXX-XXXX" className="rounded-xl border-slate-200" /></FormControl>
                            ) : (
                              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <Phone className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-bold text-slate-700">{field.value || "Não informado"}</span>
                              </div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="video_apresentacao"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vídeo Institucional (YouTube)</FormLabel>
                            {isEditing ? (
                              <FormControl><Input {...field} placeholder="Link do vídeo no YouTube" className="rounded-xl border-slate-200" /></FormControl>
                            ) : (
                              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <Youtube className="h-4 w-4 text-red-600" />
                                <span className="text-sm font-bold text-slate-700 truncate">{field.value || "Nenhum vídeo configurado"}</span>
                              </div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest px-2 flex items-center gap-2">
                       <Globe className="h-4 w-4 text-green-600" /> Redes Sociais
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="instagram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Instagram</FormLabel>
                            {isEditing ? (
                              <FormControl><Input {...field} placeholder="@suaempresa" className="rounded-xl border-slate-200" /></FormControl>
                            ) : (
                              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
                                <Instagram className="h-4 w-4 text-pink-600" />
                                <span className="text-sm font-bold text-slate-700 truncate">{field.value || "-"}</span>
                              </div>
                            )}<FormMessage /></FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="facebook"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Facebook</FormLabel>
                            {isEditing ? (
                              <FormControl><Input {...field} className="rounded-xl border-slate-200" /></FormControl>
                            ) : (
                              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
                                <Facebook className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-bold text-slate-700 truncate">{field.value || "-"}</span>
                              </div>
                            )}<FormMessage /></FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="youtube"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400">YouTube Channel</FormLabel>
                            {isEditing ? (
                              <FormControl><Input {...field} className="rounded-xl border-slate-200" /></FormControl>
                            ) : (
                              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
                                <Youtube className="h-4 w-4 text-red-600" />
                                <span className="text-sm font-bold text-slate-700 truncate">{field.value || "-"}</span>
                              </div>
                            )}<FormMessage /></FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="linkedin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400">LinkedIn</FormLabel>
                            {isEditing ? (
                              <FormControl><Input {...field} className="rounded-xl border-slate-200" /></FormControl>
                            ) : (
                              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
                                <Linkedin className="h-4 w-4 text-blue-700" />
                                <span className="text-sm font-bold text-slate-700 truncate">{field.value || "-"}</span>
                              </div>
                            )}<FormMessage /></FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="twitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400">X (Twitter)</FormLabel>
                            {isEditing ? (
                              <FormControl><Input {...field} className="rounded-xl border-slate-200" /></FormControl>
                            ) : (
                              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
                                <Twitter className="h-4 w-4 text-slate-900" />
                                <span className="text-sm font-bold text-slate-700 truncate">{field.value || "-"}</span>
                              </div>
                            )}<FormMessage /></FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>
              </form>
            </Form>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
