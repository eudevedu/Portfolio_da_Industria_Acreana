import * as React from "react"
import Image from "next/image"

export function LogoSeict({ className, ...props }: { className?: string; width?: number; height?: number }) {
  return (
    <Image
      src="/Logomarca2.jpg" // Caminho relativo à pasta public
      alt="Logo Indústria"
      width={props.width || 390} // Aumentado de 300 para 390 (30%)
      height={props.height || 78} // Aumentado de 60 para 78 (30%)
      className={className}
    />
  )
}

export function AcreBanner(props: React.SVGProps<SVGSVGElement>) {
  return (
    <Image
      src="/acre.jpg" // Caminho relativo à pasta public
      alt="Logo Acre"
      width={1920} // ou o tamanho desejado
      height={900}
    />
  )
}