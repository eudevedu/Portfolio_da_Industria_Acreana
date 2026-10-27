import { unstable_cache } from "next/cache"
import { cache } from "react"
import snapshot from "@/data/catalogo-publico.json"
import { fetchCatalog } from "./catalog-source.mjs"
import { mapCatalogMedia } from "./catalog-media.mjs"
import type { Empresa } from "./supabase.types"
import type { Categoria } from "./services/category-service"

type Catalog = { updatedAt: string | null; empresas: Empresa[]; categorias: Categoria[] }

// Sem cookies ou credenciais administrativas: o cache é compartilhado só para leitura pública.
const readCatalog = unstable_cache(
  async (): Promise<Catalog> => fetchCatalog(
    process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ),
  ["public-catalog-v1"],
  { revalidate: 300 },
)

export const getPublicCatalog = cache(async (): Promise<Catalog> => {
  try {
    return mapCatalogMedia(await readCatalog(), (snapshot as { media?: Record<string, string> }).media || {}) as Catalog
  } catch {
    // Também funciona após reiniciar o servidor ou perder o cache durante a pausa.
    return snapshot as Catalog
  }
})
