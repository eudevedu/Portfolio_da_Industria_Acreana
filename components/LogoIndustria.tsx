import * as React from "react"
import Image from "next/image"

export function BrasaoAcre(props: React.SVGProps<SVGSVGElement>) {
  return (
    <Image
      src="/BrasaoAcre.png" // Caminho relativo à pasta public
      alt="Logo Indústria"
      width={50} // ou o tamanho desejado
      height={50}
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