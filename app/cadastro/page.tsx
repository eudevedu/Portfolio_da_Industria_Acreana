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
import { toast } from "sonner"

import { AcessoForm } from "@/components/cadastro/AcessoForm"
import { EmpresaForm } from "@/components/cadastro/EmpresaForm"
import { RedesSociaisForm } from "@/components/cadastro/RedesSociaisForm"
import { ProdutosForm } from "@/components/cadastro/ProdutosForm"

import { cadastroCompletoSchema, CadastroFormData } from "@/lib/schemas/cadastro-schema"
import { register as registerAuth } from "@/lib/auth"
import { criarEmpresa, criarProduto, criarArquivo, vincularEmpresaAoPerfil } from "@/lib/database"

export default function CadastroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
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

      toast.success("Cadastro realizado com sucesso!", {
        description: "Seu perfil foi criado e está aguardando ativação.",
      })
      
      setSuccess(true)
      
      // Simula um delay para o usuário ver o feedback de sucesso antes de redirecionar
      setTimeout(() => {
        router.push("/login?success=true")
      }, 3000)
    } catch (error: any) {
      console.error("Erro no cadastro:", error)
      toast.error("Erro ao realizar cadastro", {
        description: error.message
      })
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
        <Card className="overflow-hidden border-none shadow-2xl">
          {success ? (
            <div className="py-20 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 text-center px-6">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-12 w-12 text-green-600 animate-bounce" />
              </div>
              <h2 className="text-3xl font-display font-black text-slate-900 mb-2 uppercase">Indústria Cadastrada!</h2>
              <p className="text-slate-600 max-w-md mx-auto">
                Parabéns! Suas informações foram enviadas com sucesso. 
                Você será redirecionado para a página de login em instantes.
              </p>
              <div className="mt-8 flex gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
              </div>
            </div>
          ) : (
            <>
              <CardHeader className="border-b bg-slate-50/50 p-8">
                <CardTitle className="text-2xl font-display font-black text-slate-900 uppercase">Cadastrar Nova Empresa</CardTitle>
                <CardDescription className="text-slate-500 font-medium font-sans">Preencha as informações para aparecer na plataforma oficial</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <FormProvider {...methods}>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-4 mb-10 h-12 bg-slate-100/50 p-1 rounded-xl">
                        <TabsTrigger value="acesso" className="text-[10px] uppercase font-bold tracking-tighter data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all">1. Login</TabsTrigger>
                        <TabsTrigger value="empresa" className="text-[10px] uppercase font-bold tracking-tighter data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all">2. Identidade</TabsTrigger>
                        <TabsTrigger value="contato" className="text-[10px] uppercase font-bold tracking-tighter data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all">3. Social</TabsTrigger>
                        <TabsTrigger value="produtos" className="text-[10px] uppercase font-bold tracking-tighter data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all">4. Produtos</TabsTrigger>
                      </TabsList>

                      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <TabsContent value="acesso"><AcessoForm /></TabsContent>
                        <TabsContent value="empresa"><EmpresaForm /></TabsContent>
                        <TabsContent value="contato"><RedesSociaisForm /></TabsContent>
                        <TabsContent value="produtos"><ProdutosForm /></TabsContent>
                      </div>
                    </Tabs>

                    <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="text-xs text-slate-400 font-medium">
                        <span className="text-red-500 mr-1">*</span> Campos obrigatórios
                      </div>
                      <div className="flex gap-4 w-full md:w-auto">
                        <Button 
                          type="submit" 
                          disabled={loading}
                          className="flex-1 md:flex-none bg-green-700 hover:bg-green-800 text-white font-black uppercase text-xs tracking-widest h-14 px-12 rounded-xl transition-all shadow-xl shadow-green-700/20 active:scale-95"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-3 animate-spin" /> Processando...
                            </>
                          ) : (
                            <>
                              Finalizar Cadastro <CheckCircle2 className="h-5 w-5 ml-3" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </FormProvider>
              </CardContent>
            </>
          )}
        </Card>
      </div>

    </div>
  )
}
