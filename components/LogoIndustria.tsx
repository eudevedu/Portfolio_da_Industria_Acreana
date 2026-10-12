import * as React from "react"
import Image from "next/image"

export function LogoPortfolio({ className, width = 125, height = 125 }: { className?: string; width?: number; height?: number }) {
  return (
    <Image
<<<<<<< HEAD
      src="/brand/logo-portfolio-acre-v2.png"
      alt="Portfólio Industrial do Acre"
      width={width}
      height={height}
      className={["object-contain", className].filter(Boolean).join(" ")}
=======
      src="/Logomarca2.jpg" // Caminho relativo à pasta public
      alt="Logo Indústria"
      width={props.width || 390} // Aumentado de 300 para 390 (30%)
      height={props.height || 78} // Aumentado de 60 para 78 (30%)
      className={className}
>>>>>>> 790b098bbcec49c4291db6b82aec7f1defc4288c
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
