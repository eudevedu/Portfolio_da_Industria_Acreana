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
