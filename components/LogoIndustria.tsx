import * as React from "react"
import Image from "next/image"

export function LogoPortfolio({ className, width = 125, height = 125 }: { className?: string; width?: number; height?: number }) {
  return (
    <Image
      src="/brand/logo-portfolio-acre-v2.png"
      alt="Portfólio Industrial do Acre"
      width={width}
      height={height}
      className={["object-contain", className].filter(Boolean).join(" ")}
    />
  )
}

export function AcreBanner(props: React.SVGProps<SVGSVGElement>) {
  return (
    <Image
      src="/acre.jpg" // Caminho relativo à pasta public
      alt="banner Acre"
      width={1920} // ou o tamanho desejado
      height={900}
    />
  )
}
