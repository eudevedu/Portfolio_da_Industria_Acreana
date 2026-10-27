// Apenas dados já publicados no portfólio, consultados com a chave anônima.
export async function fetchCatalog(url, key, request = fetch) {
  if (!url || !key) throw new Error("Supabase não configurado")
  async function read(table, query) {
    const rows = []
    for (let offset = 0; ; offset += 500) {
      const endpoint = new URL(`/rest/v1/${table}`, url)
      endpoint.search = new URLSearchParams({ ...query, limit: "500", offset: String(offset) }).toString()
      const response = await request(endpoint, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(4000),
        cache: "no-store",
      })
      if (!response.ok) throw new Error(`Catálogo indisponível (${response.status})`)
      const page = await response.json()
      if (!Array.isArray(page)) throw new Error("Resposta de catálogo inválida")
      rows.push(...page)
      if (page.length < 500) return rows
    }
  }
  const [empresas, categorias] = await Promise.all([
    read("empresas", { select: "id,nome_fantasia,razao_social,cnpj,setor_economico,setor_empresa,segmento,tema_segmento,descricao_produtos,apresentacao,endereco,municipio,instagram,facebook,youtube,linkedin,twitter,video_apresentacao,folder_apresentacao,status,created_at,updated_at,email,logo_url,telefone,produtos(*),arquivos(*)", status: "eq.ativo", order: "created_at.desc,id.asc" }),
    read("categorias", { select: "id,nome,slug,tipo,parent_id,created_at", order: "nome.asc,id.asc" }),
  ])
  return { updatedAt: new Date().toISOString(), empresas, categorias }
}
