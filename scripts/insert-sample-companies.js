// Script para inserir empresas de exemplo diretamente via API do Supabase
import { createClient } from '@supabase/supabase-js'

// Substitua pelas suas credenciais
const supabaseUrl = 'https://czyxfbqjonwmjqqkdesd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6eXhmYnFqb253bWpxcWtkZXNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMDA0ODgsImV4cCI6MjA2ODc3NjQ4OH0.9JiPDQM84mTD5vQRKnr5CVPTHF6gvz3Qd4qJzEaiglM'

const supabase = createClient(supabaseUrl, supabaseKey)

const empresasExemplo = [
  {
    nome_fantasia: 'AcreFoods Indústria',
    razao_social: 'AcreFoods Indústria de Alimentos Ltda',
    cnpj: '12.345.678/0001-90',
    setor_economico: 'Alimentos',
    municipio: 'Rio Branco',
    endereco: 'Rua das Palmeiras, 123, Centro',
    apresentacao: 'Empresa especializada na produção de alimentos regionais do Acre.',
    descricao_produtos: 'Polpas de frutas, castanhas e açaí orgânicos',
    instagram: '@acrefoods',
    status: 'ativo'
  },
  {
    nome_fantasia: 'Madeireira Amazônia',
    razao_social: 'Madeireira Amazônia Sustentável Ltda',
    cnpj: '98.765.432/0001-10',
    setor_economico: 'Madeira',
    municipio: 'Cruzeiro do Sul',
    endereco: 'Av. Floresta, 456, Bairro Verde',
    apresentacao: 'Produção sustentável de madeira certificada da Amazônia.',
    descricao_produtos: 'Tábuas, vigas e pisos de madeira de lei certificada',
    instagram: '@madeiraamazonia',
    status: 'ativo'
  },
  {
    nome_fantasia: 'TechAcre Solutions',
    razao_social: 'TechAcre Soluções em Tecnologia Ltda',
    cnpj: '11.222.333/0001-44',
    setor_economico: 'Tecnologia',
    municipio: 'Rio Branco',
    endereco: 'Rua da Inovação, 789, Distrito Industrial',
    apresentacao: 'Desenvolvimento de software e soluções digitais para o agronegócio.',
    descricao_produtos: 'Sistemas ERP, CRM e automação industrial',
    instagram: '@tecnoacre',
    status: 'ativo'
  },
  {
    nome_fantasia: 'Borracha Verde',
    razao_social: 'Borracha Verde Sustentável S.A.',
    cnpj: '55.666.777/0001-88',
    setor_economico: 'Borracha',
    municipio: 'Xapuri',
    endereco: 'Rua Chico Mendes, 200, Centro',
    apresentacao: 'Produção sustentável de borracha natural amazônica.',
    descricao_produtos: 'Borracha natural, látex e derivados sustentáveis',
    instagram: '@borrachaverde',
    status: 'ativo'
  },
  {
    nome_fantasia: 'Açaí do Acre',
    razao_social: 'Açaí do Acre Indústria e Comércio Ltda',
    cnpj: '99.888.777/0001-55',
    setor_economico: 'Alimentos',
    municipio: 'Tarauacá',
    endereco: 'Rua do Açaí, 300, Centro',
    apresentacao: 'Processamento e comercialização de açaí e produtos amazônicos.',
    descricao_produtos: 'Polpa de açaí, açaí em pó e sorvetes naturais',
    instagram: '@acaidoacre',
    status: 'ativo'
  },
  {
    nome_fantasia: 'Móveis Florestais',
    razao_social: 'Móveis Florestais do Acre Ltda',
    cnpj: '44.555.666/0001-22',
    setor_economico: 'Móveis',
    municipio: 'Sena Madureira',
    endereco: 'Rua da Madeira, 400, Distrito Industrial',
    apresentacao: 'Fabricação de móveis com madeira de reflorestamento.',
    descricao_produtos: 'Móveis planejados, mesas e cadeiras em madeira certificada',
    instagram: '@moveisflorestais',
    status: 'ativo'
  }
]

async function inserirEmpresas() {
  console.log('Inserindo empresas de exemplo...')
  
  const { data, error } = await supabase
    .from('empresas')
    .insert(empresasExemplo)
    .select()

  if (error) {
    console.error('Erro ao inserir empresas:', error)
    return
  }

  console.log('Empresas inseridas com sucesso:', data)
}

// Executar o script
inserirEmpresas()
