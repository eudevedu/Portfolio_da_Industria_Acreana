import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const USER_COOKIE_NAME = "user_session"

// Define as rotas que precisam de autenticação
const protectedRoutes = [
  '/dashboard',
  '/admin',
  '/api/upload',
  '/api/produtos',
  '/api/arquivos',
  '/api/auth/update-email',
  '/api/auth/update-password',
  '/api/auth/delete-account'
]

// Define as rotas de admin
const adminRoutes = [
  '/admin'
]

// Define rotas que devem ser excluídas da verificação
const excludedRoutes = [
  '/admin/login',
  '/login',
  '/cadastro',
  '/recuperar-senha',
  '/redefinir-senha'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Exclui rotas que não devem passar pelo middleware
  const isExcludedRoute = excludedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  if (isExcludedRoute) {
    return NextResponse.next()
  }
  
  // Verifica se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  if (isProtectedRoute) {
    const userCookie = request.cookies.get(USER_COOKIE_NAME)
    
    // Se não tem cookie de usuário, redireciona para login
    if (!userCookie || !userCookie.value) {
      if (isAdminRoute) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    try {
      const user = JSON.parse(userCookie.value)
      
      // Verifica se é uma rota de admin e se o usuário é admin
      if (isAdminRoute && user.tipo !== 'admin') {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      
      // Verifica se é uma rota de empresa e se o usuário tem empresa_id
      if (pathname.startsWith('/dashboard') && user.tipo === 'empresa' && !user.empresa_id) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      
    } catch (error) {
      // Cookie inválido, remove e redireciona
      const response = isAdminRoute 
        ? NextResponse.redirect(new URL('/admin/login', request.url))
        : NextResponse.redirect(new URL('/login', request.url))
      
      response.cookies.delete(USER_COOKIE_NAME)
      return response
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)  
     * - favicon.ico (favicon file)
     * - public folder
     * - login pages (to prevent redirect loops)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public|login|admin/login|cadastro|recuperar-senha|redefinir-senha|.*\\.).*)',
  ],
}
