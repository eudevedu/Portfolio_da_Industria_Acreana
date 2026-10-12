import React from "react";
import Link from "next/link";
import {
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  ArrowUpRight
} from "lucide-react";
import { LogoPortfolio } from "./LogoIndustria";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { label: 'Página Inicial', href: '/' },
    { label: 'Buscar Empresas', href: '/buscar' },
    { label: 'Cadastrar Indústria', href: '/cadastro' },
    { label: 'Login', href: '/login' },
    { label: 'Sobre o Projeto', href: '#' },
  ];

  const setoresPrincipais = [
    { label: 'Alimentos e Bebidas', href: '/buscar' },
    { label: 'Madeira e Móveis', href: '/buscar' },
    { label: 'Construção Civil', href: '/buscar' },
    { label: 'Agroindústria', href: '/buscar' },
  ];

  return (
    <footer className="relative z-[60] bg-brand-petrol text-white pt-24 pb-12 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-20">
          {/* Brand Column */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-2xl border border-white/10 shadow-xl">
                <LogoPortfolio className="h-10 w-10 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-display font-black tracking-tight leading-none">PORTFÓLIO</span>
                <span className="text-[0.65rem] font-bold tracking-[0.2em] text-[#75CED2] uppercase">Indústria Acreana</span>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed max-w-xs">
              Plataforma independente dedicada à indústria acreana. Conectando empresas, produtos e serviços para fortalecer a economia local.
            </p>

            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all transform hover:-translate-y-1">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-700 hover:text-white transition-all transform hover:-translate-y-1">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation Columns */}
          <div>
            <h4 className="text-lg font-display font-bold mb-8 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Navegação
            </h4>
            <ul className="space-y-4">
              {navLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="group flex items-center text-white hover:text-white transition-colors"
                  >
                    <span className="text-sm">{item.label}</span>
                    <ArrowUpRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Industry Sectors */}
          <div>
            <h4 className="text-lg font-display font-bold mb-8 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Setores Principais
            </h4>
            <div className="grid grid-cols-1 gap-4">
              {setoresPrincipais.map((setor) => (
                <Link
                  key={setor.label}
                  href={setor.href}
                  className="text-sm text-slate-400 hover:text-[#75CED2] transition-colors flex items-center gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  {setor.label}
                </Link>
              ))}
            </div>
          </div>

          {/* About the project */}
          <div>
            <h4 className="text-lg font-display font-bold mb-8 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Sobre o Portfólio
            </h4>
            <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
              <p>Um projeto independente para dar visibilidade às empresas e à produção do Acre.</p>
              <p>Explore o catálogo ou cadastre sua empresa para apresentar seus produtos e serviços.</p>
              <Link href="/cadastro" className="inline-flex items-center gap-2 text-[#75CED2] hover:text-white transition-colors">
                Fazer parte do Portfólio <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="relative pt-12 pb-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[0.7rem] sm:text-xs">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-white font-medium">
            <Link href="#" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="#" className="hover:text-white transition-colors">Termos de Uso</Link>
            <Link href="#" className="hover:text-white transition-colors">Cookies</Link>
          </div>

          <p className="text-slate-600 text-center md:text-right">
            © {currentYear} Portfólio Industrial do Acre. Desenvolvido por <a href="https://eudevedu.github.io/" target="_blank" rel="noopener noreferrer" className="text-primary/80 hover:text-[#75CED2] font-bold transition-colors underline underline-offset-4 decoration-current/30">Eduardo Batista</a>.
          </p>
        </div>
      </div>
    </footer>
  );
}

