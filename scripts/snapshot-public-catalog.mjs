import { createRequire } from "node:module"
import { writeFile, rename, mkdir, access } from "node:fs/promises"
import { createHash } from "node:crypto"
import { extname } from "node:path"
import { mapCatalogMedia } from "../lib/catalog-media.mjs"
import { fetchCatalog } from "../lib/catalog-source.mjs"

// Resolve a dependência pelo Next também em instalações isoladas do pnpm.
const requireFromNext = createRequire(import.meta.resolve("next/package.json"))
requireFromNext("@next/env").loadEnvConfig(process.cwd())
try {
  const catalog = await fetchCatalog(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const media = {}
  const urls = new Set()
  function collect(value) {
    if (typeof value === "string" && value.includes("/storage/v1/object/public/")) urls.add(value)
    else if (value && typeof value === "object") Object.values(value).forEach(collect)
  }
  collect(catalog)
  await mkdir(new URL("../public/catalogo-media/", import.meta.url), { recursive: true })
  for (const original of urls) {
    const remote = new URL(original)
    // Copia apenas arquivos do Storage deste projeto.
    if (remote.origin !== new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin) continue
    const extension = extname(remote.pathname).toLowerCase()
    if (!/^\.(png|jpe?g|webp|gif|avif|pdf|svg)$/.test(extension)) continue
    const name = createHash("sha256").update(original).digest("hex").slice(0, 24) + extension
    const file = new URL(`../public/catalogo-media/${name}`, import.meta.url)
    try {
      try { await access(file) } catch {
        const response = await fetch(remote, { signal: AbortSignal.timeout(10000) })
        if (!response.ok) throw new Error("Mídia indisponível")
        await writeFile(file, new Uint8Array(await response.arrayBuffer()))
      }
      media[original] = `/catalogo-media/${name}`
    } catch {
      console.warn("Não foi possível copiar uma mídia pública; mantendo seu endereço original.")
    }
  }
  const saved = { ...mapCatalogMedia(catalog, media), media }
  const target = new URL("../data/catalogo-publico.json", import.meta.url)
  const temporary = new URL("../data/catalogo-publico.json.tmp", import.meta.url)
  await writeFile(temporary, JSON.stringify(saved, null, 2) + "\n")
  await rename(temporary, target)
  console.log(`Cópia pública atualizada: ${catalog.empresas.length} empresas e ${catalog.categorias.length} categorias, ${Object.keys(media).length} mídias locais.`)
} catch {
  // Nunca substitui a última cópia válida por erro ou bloqueia um deploy na pausa.
  console.warn("Catálogo indisponível. Mantendo a cópia pública existente para o build.")
}
