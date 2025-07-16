import Link from "next/link"
import { Frown } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <Frown className="mb-4 h-16 w-16 text-gray-400" />
      <h1 className="text-4xl font-bold text-gray-900">404 - Empresa Não Encontrada</h1>
      <p className="mt-4 text-lg text-gray-600">
        Desculpe, não conseguimos encontrar a empresa que você está procurando.
      </p>
      <Link href="/buscar" className="mt-8">
        <Button>Voltar para a Busca de Empresas</Button>
      </Link>
    </div>
  )
}
