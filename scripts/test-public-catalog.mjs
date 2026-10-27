import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { SourceTextModule, SyntheticModule, createContext } from 'node:vm'
import { fetchCatalog } from '../lib/catalog-source.mjs'
import { mapCatalogMedia } from '../lib/catalog-media.mjs'
assert.deepEqual(mapCatalogMedia({logo: 'remote', products: [{image: 'remote'}]}, {remote: '/catalogo-media/image.png'}), {logo: '/catalogo-media/image.png', products: [{image: '/catalogo-media/image.png'}]})

const company = { id: 'one', status: 'ativo', nome_fantasia: 'Indústria Açaí', municipio: 'Rio Branco', produtos: [{ nome: 'Polpa' }] }
let available = true
let calls = 0
const request = async (url, options) => {
  calls++
  assert.equal(options.headers.apikey, 'anon')
  assert.ok(options.signal)
  if (!available) return Response.json({}, { status: 503 })
  return Response.json(url.pathname.endsWith('empresas') ? [company] : [{ id: 'cat', tipo: 'setor_economico' }])
}
const catalog = await fetchCatalog('https://example.test', 'anon', request)
assert.equal(catalog.empresas.length, 1)
available = false
await assert.rejects(fetchCatalog('https://example.test', 'anon', request))
await assert.rejects(fetchCatalog(null, null, request))
await assert.rejects(fetchCatalog('https://example.test', 'anon', async () => { throw new Error('DNS') }))
await assert.rejects(fetchCatalog('https://example.test', 'anon', async () => Response.json({})))
let pages = 0
const paginated = await fetchCatalog('https://example.test', 'anon', async url => {
  if (url.pathname.endsWith('categorias')) return Response.json([])
  pages++
  return Response.json(url.searchParams.get('offset') === '0' ? Array(500).fill(company) : [company])
})
assert.equal(pages, 2)
assert.equal(paginated.empresas.length, 501)
const context = createContext({ console, process: { env: {} } })
function mock(exports) {
  return new SyntheticModule(Object.keys(exports), function () {
    for (const [key, value] of Object.entries(exports)) this.setExport(key, value)
  }, { context })
}
let mode = 'offline'
let saved
const cache = mock({ unstable_cache: fn => async () => {
  try { saved = await fn(); return saved } catch (err) { if (saved) return saved; throw err }
} })
const snapshot = { ...catalog, empresas: [company, { id: 'private', status: 'pendente' }] }
const source = mock({ fetchCatalog: async () => {
  if (mode === 'offline') throw new Error('Paused')
  return { ...catalog, empresas: [{ ...company, nome_fantasia: 'Atualizada' }] }
} })
const fallback = mock({ default: snapshot })
async function load(file, dependencies) {
  const module = new SourceTextModule(stripTypeScriptTypes(readFileSync(file, 'utf8')), { context })
  await module.link(specifier => {
    assert.ok(dependencies[specifier], `Unexpected import ${specifier}`)
    return dependencies[specifier]
  })
  await module.evaluate()
  return module
}
const catalogModule = await load('lib/public-catalog.ts', {
  'react': mock({ cache: fn => fn }),
  'next/cache': cache, '@/data/catalogo-publico.json': fallback, './catalog-source.mjs': source, './catalog-media.mjs': mock({ mapCatalogMedia }),
})
const actions = (await load('lib/public-actions.ts', { './public-catalog': catalogModule })).namespace
assert.equal((await actions.buscarEmpresas()).length, 1, 'Never expose unpublished companies')
assert.equal((await actions.buscarEmpresas({ busca: 'acai' })).length, 1)
assert.equal((await actions.buscarEmpresas({ busca: 'polpa' })).length, 1)
assert.equal((await actions.buscarEmpresas({ municipio: 'Xapuri' })).length, 0)
assert.equal((await actions.buscarEmpresas({ status: 'pendente' })).length, 0)
assert.equal((await actions.buscarEmpresaPorId('one')).id, 'one')
assert.equal(await actions.buscarEmpresaPorId('missing'), null)
assert.equal((await actions.buscarCategorias('atividade_principal')).length, 0)
assert.equal((await actions.obterEstatisticasHome()).totalProdutos, 1)
assert.equal((await actions.obterEstatisticasHome()).totalMunicipios, 22)
mode = 'online'
assert.equal((await actions.buscarEmpresaPorId('one')).nome_fantasia, 'Atualizada')
mode = 'offline'
assert.equal((await actions.buscarEmpresaPorId('one')).nome_fantasia, 'Atualizada')
assert.equal((await actions.getLastCompanies(0)).length, 0)
console.log('Catálogo validado: pausa, falha de rede, resposta inválida, cópia embarcada, recuperação, filtros e dados públicos.')
