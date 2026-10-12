export function formatPhone(value: string): string {
  if (!value) return ""
  
  // Remove tudo que não é dígito
  value = value.replace(/\D/g, "")
  
  // Limita a 11 dígitos (incluindo o 9 extra de celulares brasileiros)
  value = value.substring(0, 11)
  
  if (value.length <= 10) {
    // Formato (XX) XXXX-XXXX
    return value
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
  } else {
    // Formato (XX) XXXXX-XXXX
    return value
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
  }
}

export function unformatPhone(value: string): string {
  return value.replace(/\D/g, "")
}
