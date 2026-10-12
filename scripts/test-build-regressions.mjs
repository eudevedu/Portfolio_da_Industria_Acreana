import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { stripTypeScriptTypes } from "node:module"
import { SourceTextModule, SyntheticModule, createContext } from "node:vm"

// Exercita os handlers reais com dependências simuladas, sem acesso ao banco.
const state = { client: null, user: null, admin: null, calls: 0, recovery: null }
const context = createContext({ console, URL, process: { env: { NODE_ENV: "production" } } })
function mock(exports) {
  return new SyntheticModule(Object.keys(exports), function () {
    for (const [key, value] of Object.entries(exports)) this.setExport(key, value)
  }, { context })
}
const modules = new Map([
  ["next/server", mock({ NextRequest: Request, NextResponse: {
    json: (body, options) => Response.json(body, options),
    redirect: (url) => Response.redirect(url, 307),
  } })],
  ["next/headers", mock({ headers: async () => new Headers({ origin: "https://portfolio.test" }) })],
  ["next/navigation", mock({ redirect: () => { throw new Error("Unexpected redirect") } })],
  ["supabase", mock({
    createAdminClient: () => { state.calls++; return state.client },
    createServerSideClient: async () => state.client,
  })],
  ["auth-guards", mock({ getAuthenticatedUser: async () => state.user })],
])
async function load(file) {
  const source = stripTypeScriptTypes(readFileSync(file, "utf8"))
  const module = new SourceTextModule(source, { context, identifier: file })
  await module.link((specifier) => {
    const key = specifier.endsWith("/supabase") ? "supabase"
      : specifier.endsWith("/auth-guards") ? "auth-guards"
        : specifier.endsWith("/admin-api") ? "admin-api" : specifier
    const dependency = modules.get(key)
    assert.ok(dependency, `Dependência não simulada: ${specifier}`)
    return dependency
  })
  await module.evaluate()
  return module
}
modules.set("admin-api", await load("lib/admin-api.ts"))
const routes = [
  [await load("app/api/criar-admin/route.ts"), "POST"],
  [await load("app/api/gerenciar-admin/route.ts"), "PUT"],
  [await load("app/api/gerenciar-admin/route.ts"), "DELETE"],
  [await load("app/api/resetar-senha-admin/route.ts"), "POST"],
]
assert.equal(state.calls, 0, "Importar rotas não deve criar o cliente administrativo")
let checks = 1
function request(method) {
  return new Request("https://portfolio.test/api/admin", {
    method, ...(method === "DELETE" ? {} : { body: "{}", headers: { "Content-Type": "application/json" } }),
  })
}
const client = {
  from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: state.admin, error: null }) }) }) }),
  auth: {
    resetPasswordForEmail: async (email, options) => { state.recovery = { email, options }; return { error: null } },
    exchangeCodeForSession: async () => ({ error: null }),
  },
}
for (const [route, method] of routes) {
  state.client = null
  assert.equal((await route.namespace[method](request(method))).status, 503)
  state.client = client
  state.user = null
  assert.equal((await route.namespace[method](request(method))).status, 401)
  state.user = { id: "user-id" }
  state.admin = { ativo: false }
  assert.equal((await route.namespace[method](request(method))).status, 403)
  state.admin = { ativo: true }
  assert.equal((await route.namespace[method](request(method))).status, 400)
  checks += 4
}
const auth = await load("lib/auth.ts")
state.client = null
assert.equal((await auth.namespace.recoverPassword("usuario@exemplo.com")).success, false)
state.client = client
assert.equal((await auth.namespace.recoverPassword("email-invalido")).success, false)
assert.equal((await auth.namespace.recoverPassword(" usuario@exemplo.com ")).success, true)
assert.equal(state.recovery.email, "usuario@exemplo.com")
assert.equal(state.recovery.options.redirectTo, "https://portfolio.test/auth/callback")
checks += 5
const callback = await load("app/auth/callback/route.ts")
for (const [query, destination] of [["?code=valid", "/redefinir-senha"], ["", "/recuperar-senha"]]) {
  const url = `https://portfolio.test/auth/callback${query}`
  const response = await callback.namespace.GET({ url, nextUrl: new URL(url) })
  assert.equal(new URL(response.headers.get("location")).pathname, destination)
  checks++
}
// Também valida a fábrica real, incluindo configuração parcial de ambiente.
for (const env of [{}, { NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co" }, {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "test-server-key",
}]) {
  const sdkCalls = []
  const sdk = mock({ createClient: (...args) => { sdkCalls.push(args); return client } })
  const ssr = mock({ createServerClient: () => client, createBrowserClient: () => client })
  context.process.env = env
  const source = new SourceTextModule(stripTypeScriptTypes(readFileSync("lib/supabase.ts", "utf8")), { context })
  await source.link((specifier) => specifier === "@supabase/ssr" ? ssr : sdk)
  await source.evaluate()
  assert.equal(sdkCalls.length, 0, "Importar sem chave pública não deve criar clientes")
  const adminClient = source.namespace.createAdminClient()
  assert.equal(adminClient, env.SUPABASE_SERVICE_ROLE_KEY ? client : null)
  if (adminClient) assert.equal(sdkCalls[0][2].auth.persistSession, false)
  checks += adminClient ? 3 : 2
}
console.log(`${checks} verificações passaram: importação sem chaves, acesso administrativo e recuperação de senha.`)
