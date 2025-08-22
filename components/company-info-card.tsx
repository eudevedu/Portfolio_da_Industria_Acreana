"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Pencil, Save, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { UploadComponent } from "@/components/upload-component"

import type { Empresa } from "../lib/supabase.types" // Caminho relativo
import { atualizarEmpresa } from "../lib/database" // Caminho relativo
import { formatCnpj, unformatCnpj } from "../lib/cnpj-mask" // Caminho relativo

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
  status: z.enum(["ativo", "pendente", "inativo"], {
    required_error: "Status é obrigatório.",
  }),
})

interface CompanyInfoCardProps {
  initialData: Empresa | null
  empresaId: string
}

export function CompanyInfoCard({ initialData, empresaId }: CompanyInfoCardProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

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
      status: initialData?.status || "pendente",
    },
  })

  // Resetar o formulário quando initialData mudar (ex: ao carregar uma nova empresa)
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
        status: initialData.status || "pendente",
      })
    }
  }, [initialData, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    
    // Defer processing to prevent UI blocking
    const processUpdate = async () => {
      try {
        const updatedData: Partial<Empresa> = {
          ...values,
          cnpj: unformatCnpj(values.cnpj), // Desformata o CNPJ antes de enviar
        }
        
        console.log("Atualizando empresa com dados:", updatedData)
        const result = await atualizarEmpresa(empresaId, updatedData)

        if (result) {
          console.log("Empresa atualizada com sucesso:", result)
          toast.success("Informações da empresa atualizadas com sucesso!")
          setIsEditing(false) // Sai do modo de edição após salvar
        } else {
          console.error("Erro: resultado null ao atualizar empresa")
          toast.error("Erro ao atualizar informações da empresa.")
        }
      } catch (error) {
        console.error("Erro ao salvar:", error)
        toast.error("Ocorreu um erro inesperado ao salvar.")
      } finally {
        setIsLoading(false)
      }
    }

    // Use setTimeout to defer heavy operations
    setTimeout(processUpdate, 0)
  }

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCnpj(e.target.value)
    form.setValue("cnpj", formattedValue, { shouldValidate: true })
  }

  const handleCancel = () => {
    form.reset(form.formState.defaultValues) // Volta aos valores originais
    setIsEditing(false)
  }

  if (!initialData && !isLoading) {
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Informações da Empresa</CardTitle>
          <CardDescription>Gerencie os dados básicos da sua empresa</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nenhuma informação da empresa encontrada ou carregando...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Informações da Empresa</CardTitle>
          <CardDescription>Gerencie os dados básicos da sua empresa</CardDescription>
        </div>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel} disabled={isLoading}>
              <X className="mr-2 h-4 w-4" /> Cancelar
            </Button>
            <Button size="sm" onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nome_fantasia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Fantasia *</FormLabel>
                  {isEditing ? (
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                  ) : (
                    <p className="text-sm text-muted-foreground">{field.value || "Não informado"}</p>
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
                  <FormLabel>Razão Social *</FormLabel>
                  {isEditing ? (
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                  ) : (
                    <p className="text-sm text-muted-foreground">{field.value || "Não informado"}</p>
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
                  <FormLabel>CNPJ *</FormLabel>
                  {isEditing ? (
                    <FormControl>
                      <Input
                        {...field}
                        onChange={handleCnpjChange}
                        maxLength={18} // 14 dígitos + 4 caracteres de máscara
                        disabled={isLoading}
                      />
                    </FormControl>
                  ) : (
                    <p className="text-sm text-muted-foreground">{field.value || "Não informado"}</p>
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
                  <FormLabel>Setor Econômico *</FormLabel>
                  {isEditing ? (
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o setor econômico" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="agroindustria">Agroindústria</SelectItem>
                        <SelectItem value="industria">Indústria</SelectItem>
                        <SelectItem value="servicos">Serviços</SelectItem>
                        <SelectItem value="comercio">Comércio</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground">{field.value || "Não informado"}</p>
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
                  <FormLabel>Setor da Empresa *</FormLabel>
                  {isEditing ? (
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o setor da empresa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="alimentos">Alimentos</SelectItem>
                        <SelectItem value="madeira">Madeira</SelectItem>
                        <SelectItem value="construcao">Construção</SelectItem>
                        <SelectItem value="tecnologia">Tecnologia</SelectItem>
                        <SelectItem value="saude">Saúde</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground">{field.value || "Não informado"}</p>
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
                  <FormLabel>Município *</FormLabel>
                  {isEditing ? (
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                  ) : (
                    <p className="text-sm text-muted-foreground">{field.value || "Não informado"}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Endereço</FormLabel>
                  {isEditing ? (
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                  ) : (
                    <p className="text-sm text-muted-foreground">{field.value || "Não informado"}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logo_url"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Logo da Empresa</FormLabel>
                  {isEditing ? (
                    <div className="space-y-3">
                      <UploadComponent
                        onUploadSuccess={(url, filename) => {
                          console.log("Upload realizado com sucesso:", { url, filename })
                          field.onChange(url)
                          form.setValue("logo_url", url)
                        }}
                        acceptedFileTypes="image/*"
                        buttonText={field.value ? "Alterar Logo" : "Upload Logo"}
                      />
                      {field.value && (
                        <div className="flex items-center gap-3">
                          <img 
                            src={field.value} 
                            alt="Logo atual" 
                            className="w-16 h-16 rounded-lg object-contain border"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              field.onChange("")
                              form.setValue("logo_url", "")
                            }}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remover
                          </Button>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Formatos aceitos: PNG, JPG, JPEG. Tamanho máximo: 5MB
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {field.value ? (
                        <>
                          <img 
                            src={field.value} 
                            alt="Logo da empresa" 
                            className="w-12 h-12 rounded-lg object-cover border"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <p className="text-sm text-muted-foreground">Logo configurado</p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">Não informado</p>
                      )}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apresentacao"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Apresentação</FormLabel>
                  {isEditing ? (
                    <FormControl>
                      <Textarea {...field} disabled={isLoading} rows={3} />
                    </FormControl>
                  ) : (
                    <p className="text-sm text-muted-foreground">{field.value || "Não informado"}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descricao_produtos"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Descrição dos Produtos</FormLabel>
                  {isEditing ? (
                    <FormControl>
                      <Textarea {...field} disabled={isLoading} rows={3} />
                    </FormControl>
                  ) : (
                    <p className="text-sm text-muted-foreground">{field.value || "Não informado"}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  {isEditing ? (
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                  ) : (
                    <p className="text-sm text-muted-foreground">{field.value || "Não informado"}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="facebook"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facebook</FormLabel>
                  {isEditing ? (
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                  ) : (
                    <p className="text-sm text-muted-foreground">{field.value || "Não informado"}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="youtube"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube</FormLabel>
                  {isEditing ? (
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                  ) : (
                    <p className="text-sm text-muted-foreground">{field.value || "Não informado"}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn</FormLabel>
                  {isEditing ? (
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                  ) : (
                    <p className="text-sm text-muted-foreground">{field.value || "Não informado"}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="twitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter</FormLabel>
                  {isEditing ? (
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                  ) : (
                    <p className="text-sm text-muted-foreground">{field.value || "Não informado"}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="video_apresentacao"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>URL do Vídeo de Apresentação</FormLabel>
                  {isEditing ? (
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                  ) : (
                    <p className="text-sm text-muted-foreground">{field.value || "Não informado"}</p>
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
                  <FormLabel>Status *</FormLabel>
                  {isEditing ? (
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground">{field.value || "Não informado"}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
