import * as React from "react"
import Image from "next/image"

export function LogoSeict({ className, ...props }: { className?: string; width?: number; height?: number }) {
  return (
    <Image
      src="/SEICT-Logo.svg" // Caminho relativo à pasta public
      alt="Logo Indústria"
      width={props.width || 125} // ou o tamanho desejado
      height={props.height || 125}
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