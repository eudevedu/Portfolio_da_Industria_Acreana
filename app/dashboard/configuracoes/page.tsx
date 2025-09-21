import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { isLoggedIn, getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LogoSeict } from "@/components/LogoIndustria"
import ConfiguracoesEmpresa from "@/components/ConfiguracoesEmpresa"

// Força renderização dinâmica devido ao uso de cookies
export const dynamic = 'force-dynamic'

export default async function ConfiguracoesPage() {
  const loggedIn = await isLoggedIn()
  const user = await getCurrentUser()

  if (!loggedIn || user?.tipo !== "empresa") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <LogoSeict className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Configurações da Conta</h1>
                <p className="text-sm text-gray-600">Gerencie suas informações de acesso</p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <ConfiguracoesEmpresa 
          userEmail={user?.email || ''} 
          empresaId={user?.empresa_id || ''} 
        />
      </div>
    </div>
  )
}
