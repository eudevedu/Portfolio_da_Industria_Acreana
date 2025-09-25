import React from "react";
import Link from "next/link";
import { LogoSeict } from "./LogoIndustria";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-green-900 from-10% to-green-600 to-90% text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <LogoSeict />
              <span className="font-bold">Governo do Estado do Acre</span>
            </div>
            <p className="text-sm text-slate-50">
              Plataforma oficial para o desenvolvimento industrial do Estado do Acre.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Empresas</h4>
            <ul className="space-y-2 text-sm text-slate-50">
              <li>
                <Link href="/cadastro">Cadastrar Empresa</Link>
              </li>
              <li>
                <Link href="/dashboard">Área da Empresa</Link>
              </li>
              <li>
                <Link href="/buscar">Buscar Empresas</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Setores</h4>
            <ul className="space-y-2 text-sm text-slate-50">
              <li>Alimentos</li>
              <li>Madeira</li>
              <li>Construção</li>
              <li>Agropecuária</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <p className="text-sm text-slate-50">
              Governo do Estado do Acre
              <br />
              SECRETARIA DE ESTADO DE INDUSTRIA, CIÊNCIA E TECNOLOGIA
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-slate-50">
          © 2025 Governo do Estado do Acre. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}

