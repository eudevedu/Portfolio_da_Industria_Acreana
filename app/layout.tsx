import type React from "react"
import type { Metadata } from "next"
import { Inter, Outfit } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { isLoggedIn, getCurrentUser } from "@/lib/auth"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
})

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
})

export const metadata: Metadata = {
  title: "Portfólio das Indústrias do Acre",
  description: "Plataforma oficial para o desenvolvimento industrial do Estado do Acre. Conectando empresas, produtos e serviços.",
  generator: "Next.js",
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const loggedIn = await isLoggedIn()
  const user = await getCurrentUser()
  const dashboardLink = user?.tipo === "admin" ? "/admin" : "/dashboard"

  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        <div className="flex flex-col min-h-screen">
          <Header loggedIn={loggedIn} user={user} dashboardLink={dashboardLink} />
          <main className="flex-grow relative z-0">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
