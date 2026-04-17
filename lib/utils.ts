import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBrazilianDate(isoString: string | Date): string {
  const date = typeof isoString === "string" ? new Date(isoString) : isoString
  // Formato completo com hora, minuto e segundo
  return format(date, "dd/MM/yyyy HH:mm:ss", { locale: ptBR })
}

export function formatBrazilianShortDate(isoString: string | Date): string {
  const date = typeof isoString === "string" ? new Date(isoString) : isoString
  // Formato apenas com data
  return format(date, "dd/MM/yyyy", { locale: ptBR })
}

/**
 * Obtém a URL base do site dinamicamente
 */
export function getURL() {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Definido no Vercel/Produção
    process?.env?.NEXT_PUBLIC_BASE_URL ?? // Fallback do .env
    'http://localhost:3000';
  
  // No cliente, usamos window.location se disponível para ser 100% fiel ao DNS acessado
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Garante que não termina com barra
  url = url.replace(/\/$/, '');
  return url;
}

/**
 * Resolve caminhos de imagem de forma agnóstica de DNS
 * Usa o proxy interno /api/storage para evitar problemas de CORS e dependência de DNS externo
 */
export function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  // Se for uma URL completa externa (que não seja do nosso Supabase), retorna como está
  if (url.startsWith('http') && !url.includes('supabase.co/storage')) {
    return url;
  }

  // Se for base64
  if (url.startsWith('data:')) {
    return url;
  }

  // Se for uma URL do Supabase, extraímos apenas o caminho relativo para passar pelo nosso PROXY
  // Isso resolve o problema de "funcionar em todos DNS"
  let cleanPath = url;
  if (url.includes('/storage/v1/object/public/')) {
    // Extrai o que vem depois de /public/ (ex: Imagem/logo.png)
    cleanPath = url.split('/public/').pop() || url;
  }

  // Remove barra inicial se houver
  cleanPath = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath;
  
  // Retorna o caminho via Proxy Interno (Agnóstico de DNS)
  return `/api/storage/${cleanPath}`;
}

