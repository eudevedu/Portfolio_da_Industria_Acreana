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
  
  // Base64 retorna direto
  if (url.startsWith('data:')) {
    return url;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return url;

  let cleanPath = url;
  
  // 1. Se for uma URL completa do Supabase (mesmo de outro projeto ou proxy antigo)
  if (url.includes('/storage/v1/object/public/')) {
    cleanPath = url.split('/public/').pop() || url;
  } 
  // 2. Se for uma URL completa externa (ex: imagem de outro site), retorna como está
  else if (url.startsWith('http')) {
    return url;
  }

  // 3. Remove resquícios de caminhos de proxy se existirem no banco/cache
  cleanPath = cleanPath.replace('api/storage/', '');
  cleanPath = cleanPath.replace('/api/storage/', '');
  
  // 4. Limpa barras iniciais
  cleanPath = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath;
  
  // Retorna a URL direta do CDN do Supabase atual (Configurado no .env)
  return `${supabaseUrl}/storage/v1/object/public/${cleanPath}`;
}

