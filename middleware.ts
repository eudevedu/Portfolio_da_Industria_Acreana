import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl
  const userTipo = user?.user_metadata?.tipo

  // 1. Proteger rotas Administrativas
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      if (userTipo === 'admin') return NextResponse.redirect(new URL('/admin', request.url))
      return response
    }

    if (!user) return NextResponse.redirect(new URL('/admin/login', request.url))
    
    // Verificação baseada em metadados para velocidade
    if (userTipo !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Verificação no Banco apenas para a Home do Admin ou ações críticas (opcional no middleware)
    if (pathname === '/admin') {
      const { data: admin } = await supabase.from('admins').select('ativo').eq('id', user.id).single()
      if (!admin || !admin.ativo) return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // 2. Proteger Dashboard de Empresas
  if (pathname.startsWith('/dashboard')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    
    // Admins podem ver o dashboard, mas usuários sem tipo 'empresa' ou 'admin' não
    if (userTipo !== 'empresa' && userTipo !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // 3. Redirecionar usuários logados que tentam acessar login/cadastro
  if ((pathname === '/login' || pathname === '/cadastro') && user) {
    return NextResponse.redirect(new URL(userTipo === 'admin' ? '/admin' : '/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth|.*\\.).*)',
  ],
}
