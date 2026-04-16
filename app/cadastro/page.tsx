"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

import { AcessoForm } from "@/components/cadastro/AcessoForm"
import { EmpresaForm } from "@/components/cadastro/EmpresaForm"
import { RedesSociaisForm } from "@/components/cadastro/RedesSociaisForm"
import { ProdutosForm } from "@/components/cadastro/ProdutosForm"

import { cadastroCompletoSchema, CadastroFormData } from "@/lib/schemas/cadastro-schema"
import { register as registerAuth } from "@/lib/auth"
import { criarEmpresa, criarProduto, criarArquivo, vincularEmpresaAoPerfil } from "@/lib/database"

export default function CadastroPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("acesso")

  const isConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const methods = useForm<CadastroFormData>({
    resolver: zodResolver(cadastroCompletoSchema),
    defaultValues: {
      acesso: { email: "", password: "", confirmPassword: "", contactName: "" },
      empresa: { nome_fantasia: "", status: "ativo", outros_arquivos_urls: [] },
      produtos: []
    }
  })

  const { handleSubmit, formState: { errors } } = methods

  const onSubmit = async (data: CadastroFormData) => {
    setLoading(true)
    try {
      const authResult = await registerAuth(
        data.acesso.email,
        data.acesso.password,
        "empresa",
        data.acesso.contactName
      )

      if (!authResult.success) throw new Error(authResult.message)

      const empresa = await criarEmpresa(data.empresa)
      if (!empresa) throw new Error("Falha ao criar empresa.")

      await vincularEmpresaAoPerfil(authResult.userId!, empresa.id)

      const uploadPromises = []
      if (data.empresa.logo_url) {
        uploadPromises.push(criarArquivo({ empresa_id: empresa.id, nome: "Logo", url: data.empresa.logo_url, tipo: "imagem", categoria: "institucional" }))
      }
      if (data.empresa.folder_apresentacao_url) {
        uploadPromises.push(criarArquivo({ empresa_id: empresa.id, nome: "Folder", url: data.empresa.folder_apresentacao_url, tipo: "pdf", categoria: "institucional" }))
      }

      for (const prod of data.produtos) {
         uploadPromises.push(criarProduto({ ...prod, empresa_id: empresa.id }))
      }

      await Promise.all(uploadPromises)

      toast({ title: "Cadastro realizado!", description: "Bem-vindo ao portfólio." })
      router.push("/login?success=true")
    } catch (error: any) {
      console.error("Erro no cadastro:", error)
      toast({ variant: "destructive", title: "Erro", description: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Original */}
      <header className="bg-gradient-to-r from-green-900 from-10% to-green-600 to-90% shadow-sm border-b mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center text-slate-50 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
            <h1 className="ml-4 text-xl font-semibold text-white">Cadastro de Empresa</h1>
          </div>
        </div>
      </header>

      {!isConfigured && (
        <div className="max-w-4xl mx-auto px-4 mb-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
             <AlertCircle className="h-5 w-5 text-yellow-400" />
             <div>
               <h3 className="text-sm font-medium text-yellow-800">Modo de Demonstração</h3>
               <p className="text-sm text-yellow-700 mt-1">Configure o Supabase para salvar dados permanentemente.</p>
             </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 pb-20">
        <Card>
          <CardHeader>
            <CardTitle>Cadastrar Nova Empresa</CardTitle>
            <CardDescription>Preencha as informações para aparecer na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4 mb-8">
                    <TabsTrigger value="acesso" className="text-xs uppercase font-bold">Acesso</TabsTrigger>
                    <TabsTrigger value="empresa" className="text-xs uppercase font-bold">Indústria</TabsTrigger>
                    <TabsTrigger value="contato" className="text-xs uppercase font-bold">Contatos</TabsTrigger>
                    <TabsTrigger value="produtos" className="text-xs uppercase font-bold text-center">Produtos</TabsTrigger>
                  </TabsList>

                  <TabsContent value="acesso"><AcessoForm /></TabsContent>
                  <TabsContent value="empresa"><EmpresaForm /></TabsContent>
                  <TabsContent value="contato"><RedesSociaisForm /></TabsContent>
                  <TabsContent value="produtos"><ProdutosForm /></TabsContent>
                </Tabs>

                <div className="mt-12 pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-400">
                    * Campos obrigatórios marcados com estrela.
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full md:w-auto bg-green-700 hover:bg-green-800 text-white font-bold h-12 px-12 rounded-lg transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processando...
                      </>
                    ) : (
                      <>
                        Finalizar Cadastro <CheckCircle2 className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
