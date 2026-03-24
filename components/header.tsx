"use client"

import { Search, Plus, Menu, X } from "lucide-react"
import { LogoSeict } from "@/components/LogoIndustria"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { logout } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

interface HeaderProps {
  loggedIn: boolean
  user: any
  dashboardLink: string
}

export default function Header({ loggedIn, user, dashboardLink }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  
  const isDashboard = pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard")

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (isDashboard) return null

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-6 lg:px-8",
          isScrolled 
            ? "bg-white/80 backdrop-blur-md shadow-sm h-16 py-2" 
            : "bg-gradient-to-r from-green-900/90 to-green-600/90 h-20 py-4"
        )}
      >
        <div className="max-w-7xl mx-auto h-full">
          {/* ... existing header content ... */}
          {/* ... keeping the full content of the header intact ... */}
          <div className="flex justify-between items-center h-full">
            {/* Logo and Title */}
            {!isDashboard && (
              <div className="flex items-center space-x-3">
                <Link href="/" className="flex items-center space-x-2 group">
                  <div className="bg-white p-1 rounded-lg shadow-sm group-hover:scale-105 transition-transform">
                    <LogoSeict className="h-10 w-10 sm:h-12 sm:w-12" />
                  </div>
                  <h1 className={cn(
                    "text-lg sm:text-xl font-bold tracking-tight transition-colors",
                    isScrolled ? "text-green-900" : "text-white"
                  )}>
                    Portfólio Industrial
                  </h1>
                </Link>
              </div>
            )}
            {isDashboard && <div className="flex-1" />}

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/buscar" 
                className={cn(
                  "text-sm font-medium hover:opacity-80 transition-opacity",
                  isScrolled ? "text-gray-700" : "text-white/90"
                )}
              >
                Buscar Empresas
              </Link>
              
              {loggedIn ? (
                <div className="flex items-center space-x-4">
                  <span className={cn(
                    "text-sm hidden lg:inline",
                    isScrolled ? "text-gray-600" : "text-white/80"
                  )}>
                    Olá, <strong>{user?.email?.split('@')[0]}</strong>
                  </span>
                  <Link href={dashboardLink}>
                    <Button variant={isScrolled ? "default" : "secondary"} size="sm">
                      Meu Painel
                    </Button>
                  </Link>
                  <form action={logout}>
                    <Button 
                      type="submit" 
                      variant="ghost" 
                      size="sm"
                      className={cn(
                        isScrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"
                      )}
                    >
                      Sair
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/login">
                    <Button 
                      variant="ghost" 
                      className={cn(
                        isScrolled ? "text-gray-700" : "text-white hover:bg-white/10"
                      )}
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/cadastro">
                    <Button className={isScrolled ? "" : "bg-white text-green-700 hover:bg-green-50 border-none"}>
                      Cadastrar Empresa
                    </Button>
                  </Link>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={isScrolled ? "text-gray-900" : "text-white"}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b shadow-xl p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
              <Link 
                href="/buscar" 
                className="block px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Buscar Empresas
              </Link>
              {loggedIn ? (
                <>
                  <div className="px-4 py-2 text-sm text-gray-500 border-t pt-4">
                    Logado como {user?.email}
                  </div>
                  <Link 
                    href={dashboardLink}
                    className="block px-4 py-2 text-green-700 font-bold"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Meu Painel
                  </Link>
                  <form action={logout}>
                    <Button type="submit" variant="outline" className="w-full justify-start text-red-600 border-red-100 hover:bg-red-50">
                      Sair da Conta
                    </Button>
                  </form>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                  <Link href="/login" className="w-full">
                    <Button variant="outline" className="w-full">Login</Button>
                  </Link>
                  <Link href="/cadastro" className="w-full">
                    <Button className="w-full">Cadastrar</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
      {!isDashboard && <div className="h-20" />} {/* Spacer for public pages */}
    </>
  )
}
