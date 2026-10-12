-- Criar a tabela de categorias e subcategorias
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('setor_economico', 'atividade_principal')),
  parent_id UUID REFERENCES categorias(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sugestão de inserts iniciais para manter a compatibilidade com os dados atuais
INSERT INTO categorias (nome, slug, tipo) VALUES 
('Indústria', 'industria', 'setor_economico'),
('Agroindústria', 'agroindustria', 'setor_economico'),
('Serviços', 'servicos', 'setor_economico'),
('Comércio', 'comercio', 'setor_economico');

INSERT INTO categorias (nome, slug, tipo) VALUES 
('Alimentos e Bebidas', 'alimentos', 'atividade_principal'),
('Madeira e Móveis', 'madeira', 'atividade_principal'),
('Construção Civil', 'construcao', 'atividade_principal'),
('Tecnologia', 'tecnologia', 'atividade_principal'),
('Têxtil', 'textil', 'atividade_principal');
