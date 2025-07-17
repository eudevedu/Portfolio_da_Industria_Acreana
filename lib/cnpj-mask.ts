export function formatCnpj(value: string): string {
  if (!value) return ""
  value = value.replace(/\D/g, "") // Remove tudo que não é dígito
  value = value.replace(/^(\d{2})(\d)/, "$1.$2") // Adiciona ponto após os dois primeiros dígitos
  value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3") // Adiciona ponto após os cinco primeiros dígitos
  value = value.replace(/\.(\d{3})(\d)/, ".$1/$2") // Adiciona barra após os oito primeiros dígitos
  value = value.replace(/(\d{4})(\d)/, "$1-$2") // Adiciona hífen após os doze primeiros dígitos
  return value
}

export function unformatCnpj(value: string): string {
  return value.replace(/\D/g, "") // Remove tudo que não é dígito
}
