"use client"

import { useState } from "react"
import { 
  Factory, 
  ShoppingBag, 
  Wrench, 
  Leaf, 
  LayoutGrid,
  Search,
  ArrowRight,
  Filter,
  ArrowUpRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import type { Categoria } from "@/lib/services/category-service"

interface SegmentFiltersProps {
  categorias: Categoria[]
  onFilterChange: (filters: { setor_economico?: string; setor_empresa?: string }) => void
}

/**
 * Filtros Rápidos (Chips) que atualizam o carrossel dinamicamente.
 */
export function QuickFilters({ categorias, onFilterChange }: SegmentFiltersProps) {
  const [selectedChipId, setSelectedChipId] = useState<string>("all")
  
  const setores = categorias.filter(c => c.tipo === "setor_economico")

  const getIconForSector = (nome: string) => {
    const n = nome.toLowerCase()
    if (n.includes("agro")) return <Leaf className="h-4 w-4" />
    if (n.includes("comércio")) return <ShoppingBag className="h-4 w-4" />
    if (n.includes("indústria")) return <Factory className="h-4 w-4" />
    if (n.includes("serviços")) return <Wrench className="h-4 w-4" />
    return <LayoutGrid className="h-4 w-4" />
  }

  const handleChipClick = (id: string) => {
    setSelectedChipId(id)
    onFilterChange({ setor_economico: id === "all" ? undefined : id })
  }

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-700 mb-8">
      <div className="flex items-center gap-3 justify-center md:justify-start overflow-hidden">
        <div className="h-px bg-primary/10 flex-1 hidden md:block" />
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/50 whitespace-nowrap">
          Filtro Rápido
        </h3>
        <div className="h-px bg-primary/10 flex-1" />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant={selectedChipId === "all" ? "default" : "outline"}
          onClick={() => handleChipClick("all")}
          className={cn(
            "rounded-full h-9 px-5 text-sm font-bold transition-all duration-300",
            selectedChipId === "all" 
              ? "bg-primary text-white shadow-lg shadow-primary/20" 
              : "border-primary/10 bg-white/50 hover:bg-primary/5 text-muted-foreground hover:text-primary"
          )}
        >
          <Filter className="h-3.5 w-3.5 mr-2" />
          Todos
        </Button>

        {setores.slice(0, 5).map((setor) => (
          <Button
            key={setor.id}
            variant={selectedChipId === setor.id ? "default" : "outline"}
            onClick={() => handleChipClick(setor.id)}
            className={cn(
              "rounded-full h-9 px-5 text-sm font-bold transition-all duration-300",
              selectedChipId === setor.id 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "border-primary/10 bg-white/50 hover:bg-primary/5 text-muted-foreground hover:text-primary"
            )}
          >
            <span className="mr-2">{getIconForSector(setor.nome)}</span>
            {setor.nome}
          </Button>
        ))}
      </div>
    </div>
  )
}

/**
 * Busca por Categoria (Advanced Search) que redireciona para a página /buscar.
 */
export function AdvancedCategorySearch({ categorias }: { categorias: Categoria[] }) {
  const router = useRouter()
  const [searchSector, setSearchSector] = useState<string>("all")
  const [searchActivity, setSearchActivity] = useState<string>("all")
  
  const setores = categorias.filter(c => c.tipo === "setor_economico")
  const atividades = categorias.filter(c => c.tipo === "atividade_principal")

  const handleSearchRedirect = () => {
    const params = new URLSearchParams()
    if (searchSector !== "all") params.set("setor_economico", searchSector)
    if (searchActivity !== "all") params.set("subcategoria", searchActivity)
    router.push(`/buscar?${params.toString()}`)
  }

  const filteredActivities = atividades.filter(a => 
    searchSector === "all" || a.parent_id === searchSector
  )

  return (
    <div className="glass rounded-[2.5rem] p-8 md:p-10 border-primary/5 shadow-inner mt-12 animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-display font-black text-foreground tracking-tight">
            Veja todas as empresas cadastradas em nossa plataforma
          </h3>
          <p className="text-sm text-muted-foreground font-medium">
            Explore o ecossistema industrial completo filtrando por setor e atividade principal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2 text-left md:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Setor / Categoria</label>
            <Select value={searchSector} onValueChange={(val) => {
              setSearchSector(val)
              setSearchActivity("all")
            }}>
              <SelectTrigger className="h-12 rounded-2xl border-primary/10 bg-white/80 backdrop-blur-sm">
                <SelectValue placeholder="Selecione o Setor" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="all">Todos os Setores</SelectItem>
                {setores.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 text-left md:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Atividade / Subcategoria</label>
            <Select value={searchActivity} onValueChange={setSearchActivity}>
              <SelectTrigger className="h-12 rounded-2xl border-primary/10 bg-white/80 backdrop-blur-sm">
                <SelectValue placeholder="Selecione a Atividade" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="all">Todas as Atividades</SelectItem>
                {filteredActivities.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleSearchRedirect}
            className="h-12 rounded-2xl font-black uppercase tracking-widest text-xs px-8 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all bg-primary md:col-span-1"
          >
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>

          <Button 
            onClick={() => router.push('/buscar')}
            variant="outline"
            className="h-12 rounded-2xl font-black uppercase tracking-widest text-xs px-8 border-primary/20 text-primary hover:bg-primary/5 md:col-span-1"
          >
            Ver Todas
            <ArrowUpRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Mantendo para compatibilidade caso outro component use
export default function SegmentFilters(props: SegmentFiltersProps) {
  return (
    <div className="space-y-12">
      <QuickFilters {...props} />
      <AdvancedCategorySearch categorias={props.categorias} />
    </div>
  )
}
