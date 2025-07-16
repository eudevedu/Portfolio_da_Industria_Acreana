-- Tabela de Empresas
CREATE TABLE IF NOT EXISTS empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_fantasia VARCHAR(255) NOT NULL,
    razao_social VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    setor_economico VARCHAR(100),
    setor_empresa VARCHAR(100),
    segmento VARCHAR(100),
    tema_segmento VARCHAR(100),
    municipio VARCHAR(100),
    endereco TEXT,
    apresentacao TEXT,
    descricao_produtos TEXT,
    instagram VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pendente', -- 'pendente', 'ativo', 'inativo'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    linha VARCHAR(255),
    descricao TEXT,
    status VARCHAR(50) DEFAULT 'ativo', -- 'ativo', 'inativo'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Arquivos (para logos, certificações, outras imagens/pdfs)
CREATE TABLE IF NOT EXISTS arquivos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    tipo VARCHAR(50), -- 'pdf', 'imagem', etc.
    categoria VARCHAR(100), -- 'institucional', 'produto', 'certificacao'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Usuários (para login na plataforma)
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'empresa', -- 'empresa', 'admin'
    empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL, -- Link para a empresa se for tipo 'empresa'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Analytics (ex: visualizações de perfil)
CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    tipo_evento VARCHAR(100) NOT NULL, -- ex: 'visualizacao_perfil', 'visualizacao_produto'
    referencia_id UUID, -- ID do produto se for visualizacao_produto
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address VARCHAR(50),
    user_agent TEXT
);

-- Índices para otimização de busca
CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON empresas(cnpj);
CREATE INDEX IF NOT EXISTS idx_empresas_municipio ON empresas(municipio);
CREATE INDEX IF NOT EXISTS idx_empresas_setor_economico ON empresas(setor_economico);
CREATE INDEX IF NOT EXISTS idx_empresas_status ON empresas(status);
CREATE INDEX IF NOT EXISTS idx_produtos_empresa_id ON produtos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_analytics_empresa_id ON analytics(empresa_id);
CREATE INDEX IF NOT EXISTS idx_analytics_tipo_evento ON analytics(tipo_evento);
