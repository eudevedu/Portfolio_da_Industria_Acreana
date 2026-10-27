import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { stripTypeScriptTypes } from "node:module"
import { createContext, SourceTextModule, SyntheticModule } from "node:vm"

const companyId = "11111111-1111-4111-8111-111111111111"
let state
function reset(overrides = {}) {
  state = { configured: true, authorized: true, profiles: [{ id: "company-user" }],
    admins: [], events: [], authFailures: [], ...overrides }
}
const client = {
  from(table) {
    const query = {
      select() { return query },
      eq() { return query },
      in() { return query },
      delete() { state.events.push(`delete:${table}`); return query },
      async maybeSingle() {
        if (state.networkFailure) throw new Error("Network failure")
        return { data: state.missingCompany ? null : { id: companyId }, error: state.deleteError || null }
      },
      then(resolve, reject) {
        const result = table === "perfis_empresas"
          ? { data: state.profiles, error: state.profileError || null }
          : { data: state.admins, error: state.adminError || null }
        return Promise.resolve(result).then(resolve, reject)
      },
    }
    return query
  },
  auth: { admin: { async deleteUser(id) {
    state.events.push(`auth:${id}`)
    if (state.authThrow === id) throw new Error("Auth failure")
    return { error: state.authFailures.includes(id) ? { message: "Auth failure" } : null }
  } } },
}
const context = createContext({ console: { error() {} }, Set })
function mock(exports) {
  return new SyntheticModule(Object.keys(exports), function () {
    for (const [key, value] of Object.entries(exports)) this.setExport(key, value)
  }, { context })
}
const supabase = mock({ createAdminClient: () => state.configured ? client : null,
  createServerSideClient: async () => client })
const auth = mock({ requireAdmin: async () => {
  state.events.push("authorize")
  if (!state.authorized) throw new Error("Acesso negado")
  return { id: "acting-admin" }
} })
const service = new SourceTextModule(stripTypeScriptTypes(readFileSync("lib/services/empresa-service.ts", "utf8")), { context })
await service.link((specifier) => specifier.endsWith("/auth-guards") ? auth : supabase)
await service.evaluate()
const exclude = service.namespace.excluirEmpresa
let cases = 0

reset({ configured: false })
assert.equal((await exclude(companyId)).success, false)
assert.deepEqual(state.events, [])
cases++

reset({ authorized: false })
await assert.rejects(exclude(companyId), /Acesso negado/)
assert.deepEqual(state.events, ["authorize"])
cases++

reset({ profileError: { message: "Read failed" } })
assert.equal((await exclude(companyId)).success, false)
assert.deepEqual(state.events, ["authorize"])
cases++

reset({ adminError: { message: "Read failed" } })
assert.equal((await exclude(companyId)).success, false)
assert.deepEqual(state.events, ["authorize"])
cases++

reset({ deleteError: { code: "23503", message: "Foreign key restriction" } })
const restricted = await exclude(companyId)
assert.equal(restricted.success, false)
assert.match(restricted.message, /vínculos/)
assert.deepEqual(state.events, ["authorize", "delete:empresas"])
cases++

reset({ missingCompany: true })
assert.equal((await exclude(companyId)).success, false)
assert.deepEqual(state.events, ["authorize", "delete:empresas"])
cases++

reset({ deleteError: { code: "23503", details: 'Key (id) is still referenced from table "produtos".' } })
const namedRestriction = await exclude(companyId)
assert.equal(namedRestriction.success, false)
assert.match(namedRestriction.message, /tabela produtos/)
assert.deepEqual(state.events, ["authorize", "delete:empresas"])
cases++

reset({ profiles: [] })
assert.equal((await exclude(companyId)).success, true)
assert.deepEqual(state.events, ["authorize", "delete:empresas"])
cases++

reset({ profiles: [{ id: "acting-admin" }, { id: "other-admin" }, { id: "company-user" }], admins: [{ id: "other-admin" }] })
assert.equal((await exclude(companyId)).success, true)
assert.deepEqual(state.events, ["authorize", "delete:empresas", "auth:company-user"])
cases++

for (const failure of [{ authFailures: ["company-user"] }, { authThrow: "company-user" }]) {
  reset(failure)
  const result = await exclude(companyId)
  assert.equal(result.success, true)
  assert.match(result.warning, /1 conta/)
  assert.deepEqual(state.events, ["authorize", "delete:empresas", "auth:company-user"])
  cases++
}

reset({ networkFailure: true })
assert.equal((await exclude(companyId)).success, false)
assert.deepEqual(state.events, ["authorize", "delete:empresas"])
cases++
const cache = mock({ revalidatePath: (path) => {
  state.events.push(`cache:${path}`)
  if (state.cacheFailure) throw new Error("Cache failure")
} })
const emptyService = mock({})
const adminAction = new SourceTextModule(stripTypeScriptTypes(readFileSync("lib/admin.ts", "utf8")), { context })
await adminAction.link((specifier) => {
  if (specifier === "next/cache") return cache
  if (specifier.endsWith("/auth-guards")) return auth
  if (specifier.endsWith("/supabase")) return supabase
  if (specifier.endsWith("/empresa-service")) return service
  return emptyService
})
await adminAction.evaluate()
reset({ missingCompany: true })
assert.equal((await adminAction.namespace.excluirEmpresa(companyId)).success, false)
assert.equal(state.events.some((event) => event.startsWith("cache:")), false)
cases++
reset({ cacheFailure: true })
const cacheResult = await adminAction.namespace.excluirEmpresa(companyId)
assert.equal(cacheResult.success, true)
assert.match(cacheResult.warning, /páginas/)
cases++
console.log(`${cases} cenários de exclusão passaram, sem operações em banco real.`)
