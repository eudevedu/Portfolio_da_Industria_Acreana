import React from "react";
import Link from "next/link";
import { 
  Instagram, 
  Facebook, 
  Youtube, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin, 
  Globe,
  ArrowUpRight
} from "lucide-react";
import { LogoSeict } from "./LogoIndustria";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#022c22] text-white pt-24 pb-12 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500/0 via-green-500/50 to-green-500/0" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-green-500/10 rounded-full blur-[100px]" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-20">
          {/* Brand Column */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl group-hover:scale-110 transition-transform">
                <LogoSeict className="h-10 w-10 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-display font-black tracking-tight leading-none">PORTFÓLIO</span>
                <span className="text-[0.65rem] font-bold tracking-[0.2em] text-green-400 uppercase">Indústria Acreana</span>
              </div>
            </div>
            
            <p className="text-slate-300 text-sm leading-relaxed max-w-xs">
              Plataforma oficial para o desenvolvimento industrial do Estado do Acre. Conectando empresas, produtos e serviços para fortalecer nossa economia local.
            </p>

            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all transform hover:-translate-y-1">
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
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Navegação
            </h4>
            <ul className="space-y-4">
              {['Página Inicial', 'Buscar Empresas', 'Cadastrar Indústria', 'Área Restrita', 'Sobre o Projeto'].map((item) => (
                <li key={item}>
                  <Link 
                    href={item === 'Página Inicial' ? '/' : `/${item.toLowerCase().replace(/ /g, '-')}`}
                    className="group flex items-center text-slate-400 hover:text-white transition-colors"
                  >
                    <span className="text-sm">{item}</span>
                    <ArrowUpRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Industry Sectors */}
          <div>
            <h4 className="text-lg font-display font-bold mb-8 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Setores Principais
            </h4>
            <div className="grid grid-cols-1 gap-4">
              {['Alimentos e Bebidas', 'Madeira e Móveis', 'Construção Civil', 'Agroindústria', 'Tecnologia'].map((setor) => (
                <Link 
                  key={setor}
                  href={`/buscar?setor=${setor}`}
                  className="text-sm text-slate-400 hover:text-green-400 transition-colors flex items-center gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  {setor}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-lg font-display font-bold mb-8 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Contato SEICT
            </h4>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1 text-[0.6rem]">Localização</p>
                  <p className="text-sm text-slate-300 leading-snug">R. Benjamin Constant, 123 - Centro, Rio Branco - AC</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1 text-[0.6rem]">Telefone</p>
                  <p className="text-sm text-slate-300">(68) 3212-4500</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1 text-[0.6rem]">E-mail</p>
                  <p className="text-sm text-slate-300">contato@seict.ac.gov.br</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="relative pt-12 pb-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[0.7rem] sm:text-xs">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-slate-500 font-medium">
            <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>

          <p className="text-slate-600 text-center md:text-right">
            © {currentYear} SEICT Acre. Desenvolvido por <a href="https://eudevedu.github.io/" target="_blank" rel="noopener noreferrer" className="text-green-500/80 hover:text-green-400 font-bold transition-colors underline underline-offset-4 decoration-current/30">Eduardo Batista</a>.
          </p>
        </div>
      </div>
    </footer>
  )
}

