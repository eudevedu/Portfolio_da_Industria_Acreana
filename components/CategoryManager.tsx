"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  CheckCircle, 
  AlertCircle,
  ChevronRight,
  Loader2,
  FolderOpen,
  LayoutGrid,
  CornerDownRight,
  PlusCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  buscarCategorias, 
  criarCategoria, 
  excluirCategoria, 
  atualizarCategoria,
  Categoria 
} from "@/lib/services/category-service"
import { Badge } from "@/components/ui/badge"

export function CategoryManager({ initialTab = "list", defaultOpenForm = false }: { initialTab?: string, defaultOpenForm?: boolean }) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Estados para Criação/Edição
  const [showFormDialog, setShowFormDialog] = useState(defaultOpenForm)
  const [isEditing, setIsEditing] = useState(false)
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    tipo: "setor_economico" as "setor_economico" | "atividade_principal",
    parent_id: "" as string | undefined
  })
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const data = await buscarCategorias()
    setCategorias(data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSave = async () => {
    if (!formData.nome) return
    setSaving(true)
    try {
      if (isEditing && currentId) {
        await atualizarCategoria(currentId, formData)
      } else {
        await criarCategoria({
          nome: formData.nome,
          tipo: formData.tipo,
          parent_id: formData.tipo === "atividade_principal" ? formData.parent_id : null
        })
      }
      await loadData()
      setShowFormDialog(false)
      setFormData({ nome: "", tipo: "setor_economico", parent_id: "" })
    } catch (error) {
      console.error(error)
      alert("Erro ao salvar categoria. Verifique se o nome é único ou tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return
    await excluirCategoria(id)
    loadData()
  }

  const handleEditClick = (cat: Categoria) => {
    setIsEditing(true)
    setCurrentId(cat.id)
    setFormData({
      nome: cat.nome,
      tipo: cat.tipo,
      parent_id: cat.parent_id || ""
    })
    setShowFormDialog(true)
  }

  const handleCreateNew = (tipo?: "setor_economico" | "atividade_principal") => {
    setIsEditing(false)
    setCurrentId(null)
    setFormData({
      nome: "",
      tipo: tipo || "setor_economico",
      parent_id: ""
    })
    setShowFormDialog(true)
  }

  const filteredCategorias = categorias.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const setores = categorias.filter(c => c.tipo === "setor_economico")
  const atividades = categorias.filter(c => c.tipo === "atividade_principal")

  // Componente interno para as linhas simples (nas abas de filtro)
  const CategoryRow = ({ cat }: { cat: Categoria }) => (
    <div className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors group">
      <div className="flex items-center gap-4">
        <div className={cat.tipo === "setor_economico" ? "p-3 bg-blue-50 text-blue-600 rounded-xl" : "p-3 bg-green-50 text-green-600 rounded-xl"}>
          {cat.tipo === "setor_economico" ? <LayoutGrid className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{cat.nome}</span>
            <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-400 border-slate-200">
              {cat.tipo === "setor_economico" ? "Setor" : "Atividade"}
            </Badge>
          </div>
          {cat.tipo === "atividade_principal" && cat.parent_id && (
            <p className="text-xs text-slate-500 mt-1">
              Vinculado a: <span className="font-semibold">{setores.find(s => s.id === cat.parent_id)?.nome || "Não encontrado"}</span>
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-blue-500 hover:bg-blue-50" onClick={() => handleEditClick(cat)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={() => handleDelete(cat.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-black text-slate-900 border-l-4 border-primary pl-4 uppercase">
            Gestão de Categorias
          </h2>
          <p className="text-slate-500 text-sm mt-1">Gerencie os setores econômicos e atividades principais das indústrias.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={() => handleCreateNew()} className="flex-1 sm:flex-none h-11 rounded-xl shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4 mr-2" /> Novo Setor
          </Button>
          <Button variant="outline" onClick={() => handleCreateNew("atividade_principal")} className="flex-1 sm:flex-none h-11 rounded-xl">
             Nova Subcategoria
          </Button>
        </div>
      </div>

      <Card className="rounded-[2rem] border-slate-200 overflow-hidden shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar categoria..." 
                className="pl-10 rounded-xl h-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex bg-white p-1 rounded-xl border border-slate-200">
               <Button 
                variant={activeTab === "list" ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setActiveTab("list")}
                className="rounded-lg h-8 px-4 font-bold"
              >
                Hierarquia
              </Button>
               <Button 
                variant={activeTab === "setores" ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setActiveTab("setores")}
                className="rounded-lg h-8 px-4 font-bold"
              >
                Só Setores
              </Button>
               <Button 
                variant={activeTab === "atividades" ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setActiveTab("atividades")}
                className="rounded-lg h-8 px-4 font-bold"
              >
                Só Atividades
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p className="font-medium">Carregando categorias...</p>
            </div>
          ) : filteredCategorias.length === 0 ? (
            <div className="p-20 flex flex-col items-center justify-center text-slate-400">
              <FolderOpen className="h-12 w-12 mb-4 opacity-20" />
              <p className="font-medium text-lg">Nenhuma categoria encontrada</p>
              <Button variant="link" onClick={() => handleCreateNew()}>Cadastrar a primeira</Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activeTab === "setores" ? (
                setores.filter(s => s.nome.toLowerCase().includes(searchTerm.toLowerCase())).map(cat => (
                  <CategoryRow key={cat.id} cat={cat} />
                ))
              ) : activeTab === "atividades" ? (
                atividades.filter(a => a.nome.toLowerCase().includes(searchTerm.toLowerCase())).map(cat => (
                  <CategoryRow key={cat.id} cat={cat} />
                ))
              ) : (
                // Lógica de Árvore (TUDO)
                setores.map(setor => {
                  const children = atividades.filter(a => a.parent_id === setor.id)
                  const matchesSearch = setor.nome.toLowerCase().includes(searchTerm.toLowerCase())
                  const matchingChildren = children.filter(c => c.nome.toLowerCase().includes(searchTerm.toLowerCase()))
                  
                  if (!matchesSearch && matchingChildren.length === 0 && searchTerm) return null

                  return (
                    <div key={setor.id} className="bg-white">
                      <div className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors group border-b border-slate-50">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shadow-sm border border-blue-100/50">
                            <LayoutGrid className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900 tracking-tight">{setor.nome}</span>
                              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none text-[9px] uppercase font-black px-2">Setor</Badge>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider font-bold">
                              {children.length} subcategor{children.length === 1 ? 'ia' : 'ias'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 gap-1 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg px-2"
                            onClick={() => {
                              setIsEditing(false)
                              setFormData({ nome: "", tipo: "atividade_principal", parent_id: setor.id })
                              setShowFormDialog(true)
                            }}
                          >
                            <PlusCircle className="h-3.5 w-3.5" /> <span className="text-[10px] font-bold uppercase">Sub</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg" onClick={() => handleEditClick(setor)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg" onClick={() => handleDelete(setor.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Filhos */}
                      <div className="bg-slate-50/30">
                        {children.map((child, idx) => {
                          const isChildVisible = !searchTerm || child.nome.toLowerCase().includes(searchTerm.toLowerCase())
                          if (!isChildVisible) return null

                          return (
                            <div key={child.id} className="flex items-center justify-between py-3 pr-6 pl-12 hover:bg-white transition-colors group/child animate-in slide-in-from-left-2 duration-200" style={{ transitionDelay: `${idx * 50}ms` }}>
                              <div className="flex items-center gap-3">
                                <CornerDownRight className="h-4 w-4 text-slate-300" />
                                <div className="p-2 bg-white text-green-600 rounded-lg shadow-sm border border-slate-200">
                                  <ChevronRight className="h-4 w-4" />
                                </div>
                                <span className="font-semibold text-slate-700 text-sm">{child.nome}</span>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover/child:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-md" onClick={() => handleEditClick(child)}>
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md" onClick={() => handleDelete(child.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })
              )}

              {/* Atividades Órfãs (sem pai) - Se houver */}
              {activeTab === "list" && atividades.filter(a => !a.parent_id).length > 0 && (
                <div className="mt-4">
                  <div className="px-6 py-2 bg-slate-100/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                    Sem Vínculo (Atividades Soltas)
                  </div>
                  {atividades.filter(a => !a.parent_id).map(child => (
                    <div key={child.id} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-100 text-slate-400 rounded-xl">
                          <ChevronRight className="h-5 w-5" />
                        </div>
                        <div>
                           <span className="font-bold text-slate-900">{child.nome}</span>
                           <Badge variant="outline" className="ml-2 text-[10px] uppercase font-bold text-slate-300">Órfã</Badge>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-blue-500 hover:bg-blue-50" onClick={() => handleEditClick(child)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={() => handleDelete(child.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 uppercase">
              {isEditing ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? "Altere as informações da categoria abaixo." : "Preencha os dados da nova categoria/subcategoria."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className="font-bold text-slate-700">Nome da Categoria *</Label>
              <Input 
                id="nome" 
                placeholder="Ex: Indústria, Alimentos e Bebidas..." 
                className="rounded-xl h-11"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Tipo de Categorização</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  type="button"
                  variant={formData.tipo === "setor_economico" ? "default" : "outline"}
                  onClick={() => setFormData({...formData, tipo: "setor_economico", parent_id: ""})}
                  className="rounded-xl h-11 font-bold"
                >
                  Setor Econômico
                </Button>
                <Button 
                  type="button"
                  variant={formData.tipo === "atividade_principal" ? "default" : "outline"}
                  onClick={() => setFormData({...formData, tipo: "atividade_principal"})}
                  className="rounded-xl h-11 font-bold"
                >
                  Atividade Principal
                </Button>
              </div>
            </div>

            {formData.tipo === "atividade_principal" && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <Label htmlFor="parent" className="font-bold text-slate-700">Setor Econômico (Pai)</Label>
                <Select value={formData.parent_id} onValueChange={(v) => setFormData({...formData, parent_id: v})}>
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue placeholder="Selecione o setor pai..." />
                  </SelectTrigger>
                  <SelectContent>
                    {setores.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-slate-400">Vincule esta atividade a um setor maior para melhor organização.</p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setShowFormDialog(false)} className="rounded-xl h-11 font-bold">Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !formData.nome} className="rounded-xl h-11 font-bold px-8 shadow-lg shadow-primary/20">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : isEditing ? "Salvar Alterações" : "Criar Categoria"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
