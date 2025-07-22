import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Portfólio das Indústrias do Acre",
  description: "Plataforma oficial para o desenvolvimento industrial do Estado do Acre. Conectando empresas, produtos e serviços.",
  generator: "Next.js",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-industria.svg', type: 'image/svg+xml' },
    ],
    apple: '/BrasaoAcre.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
