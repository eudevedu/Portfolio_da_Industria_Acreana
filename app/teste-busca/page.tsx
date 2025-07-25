import { buscarEmpresas } from "@/lib/database"
import type { Empresa } from "@/lib/supabase.types"
import Link from "next/link"

// Força renderização dinâmica
export const dynamic = 'force-dynamic'

export default async function TesteBusca() {
  let empresas: Empresa[] = []
  let error = null

  try {
    empresas = await buscarEmpresas({})
    console.log(`✅ Página de teste - ${empresas.length} empresas carregadas`)
  } catch (err) {
    console.error("❌ Erro na página de teste:", err)
    error = err instanceof Error ? err.message : "Erro desconhecido"
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Teste - Lista de Empresas</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Erro:</strong> {error}
        </div>
      )}

      <p className="mb-4">Total de empresas encontradas: <strong>{empresas.length}</strong></p>

      {empresas.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Nenhuma empresa encontrada no banco de dados.
        </div>
      ) : (
        <div className="space-y-4">
          {empresas.map((empresa) => (
            <div key={empresa.id} className="border rounded-lg p-4 bg-white shadow">
              <h2 className="text-lg font-semibold">{empresa.nome_fantasia}</h2>
              <p className="text-gray-600">{empresa.razao_social}</p>
              <p className="text-sm text-gray-500">
                <strong>Status:</strong> {empresa.status} | 
                <strong> Município:</strong> {empresa.municipio} | 
                <strong> Setor:</strong> {empresa.setor_economico}
              </p>
              {empresa.apresentacao && (
                <p className="text-sm mt-2 text-gray-700">
                  {empresa.apresentacao.substring(0, 100)}...
                </p>
              )}
              <div className="mt-2">
                <Link 
                  href={`/empresas/${empresa.id}`}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Ver detalhes →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 pt-4 border-t">
        <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
          ← Voltar para a página inicial
        </Link>
        <span className="mx-4">|</span>
        <Link href="/buscar" className="text-blue-600 hover:text-blue-800 underline">
          Ir para busca completa →
        </Link>
      </div>
    </div>
  )
}
