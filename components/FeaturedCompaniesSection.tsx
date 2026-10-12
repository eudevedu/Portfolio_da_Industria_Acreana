"use client"

import { useState, useEffect } from "react"
import { QuickFilters, AdvancedCategorySearch } from "./SegmentFilters"
import HomeCompanyCarousel from "./HomeCompanyCarousel"
import { buscarEmpresas } from "@/lib/services/empresa-service"
import type { Empresa } from "@/lib/supabase.types"
import type { Categoria } from "@/lib/services/category-service"
import { Loader2 } from "lucide-react"

interface FeaturedCompaniesSectionProps {
  initialEmpresas: Empresa[]
  categorias: Categoria[]
}

export default function FeaturedCompaniesSection({ 
  initialEmpresas, 
  categorias 
}: FeaturedCompaniesSectionProps) {
  const [empresas, setEmpresas] = useState<Empresa[]>(initialEmpresas)
  const [loading, setLoading] = useState(false)
  const [activeFilters, setActiveFilters] = useState<{ 
    setor_economico?: string; 
    setor_empresa?: string 
  }>({})

  useEffect(() => {
    // Não executa no primeiro render (já temos initialEmpresas)
    if (Object.keys(activeFilters).length === 0 && empresas === initialEmpresas) return

    const fetchFiltered = async () => {
      setLoading(true)
      try {
        const results = await buscarEmpresas({
          ...activeFilters,
          status: "ativo"
        })
        // No home, queremos limitar a exibição (ex: 24 como antes)
        setEmpresas(results.slice(0, 24))
      } catch (error) {
        console.error("Erro ao filtrar empresas na home:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFiltered()
  }, [activeFilters])

  const handleFilterChange = (newFilters: { setor_economico?: string; setor_empresa?: string }) => {
    setActiveFilters(newFilters)
  }

  return (
    <div className="space-y-8">
      {/* 1. Filtro Rápido no Topo */}
      <QuickFilters 
        categorias={categorias} 
        onFilterChange={handleFilterChange} 
      />

      {/* 2. Carrossel de Empresas no Meio */}
      <div className="relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-3xl transition-all">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary animate-pulse">Atualizando...</span>
            </div>
          </div>
        )}
        
        <HomeCompanyCarousel empresas={empresas} />
      </div>

      {/* 3. Busca Avançada por Categoria no Final */}
      <AdvancedCategorySearch categorias={categorias} />
    </div>
  )
}
