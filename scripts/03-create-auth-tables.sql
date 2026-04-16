-- Tabela para armazenar informações adicionais de usuários (empresas)
-- Esta tabela se relaciona com a tabela 'users' do Supabase Auth
CREATE TABLE IF NOT EXISTS perfis_empresas (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL, -- Link para a empresa cadastrada
    nome_contato VARCHAR(255),
    telefone VARCHAR(50),
    cargo VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar usuários administradores
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    cargo VARCHAR(100),
    Senha varchar, (16),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security) para as novas tabelas
ALTER TABLE public.perfis_empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para perfis_empresas
CREATE POLICY "Usuários podem ver seus próprios perfis" ON public.perfis_empresas
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios perfis" ON public.perfis_empresas
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuários autenticados podem criar perfis" ON public.perfis_empresas
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas de segurança para admins (apenas admins podem ver/gerenciar)
-- Você precisará de uma função ou claim JWT para identificar admins
-- Exemplo (requer configuração de custom claims ou função no Supabase):
-- CREATE POLICY "Admins podem ver todos os admins" ON public.admins
--   FOR SELECT USING (is_admin(auth.uid()));

-- CREATE POLICY "Admins podem gerenciar admins" ON public.admins
--   FOR ALL USING (is_admin(auth.uid()));

-- Por enquanto, para fins de demonstração, vamos permitir que o serviço de autenticação insira
-- e que apenas o proprietário (admin) possa ver/atualizar, se houver um mecanismo de identificação.
-- Para um ambiente de produção, a política de admins deve ser mais robusta.

-- Exemplo simplificado para admins (ajustar conforme a lógica de admin no seu app)
CREATE POLICY "Admins podem ver todos os admins (demo)" ON public.admins
  FOR SELECT USING (true); -- Apenas para demonstração, em produção, use uma função de admin

CREATE POLICY "Admins podem inserir admins (demo)" ON public.admins
  FOR INSERT WITH CHECK (true); -- Apenas para demonstração

CREATE POLICY "Admins podem atualizar admins (demo)" ON public.admins
  FOR UPDATE USING (true); -- Apenas para demonstração

CREATE POLICY "Admins podem deletar admins (demo)" ON public.admins
  FOR DELETE USING (true); -- Apenas para demonstração

-- Trigger para atualizar 'updated_at' automaticamente
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_empresas_updated_at
BEFORE UPDATE ON empresas
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_produtos_updated_at
BEFORE UPDATE ON produtos
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_perfis_empresas_updated_at
BEFORE UPDATE ON perfis_empresas
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_admins_updated_at
BEFORE UPDATE ON admins
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Este arquivo já foi criado e seu conteúdo está no 01-create-tables.sql
-- Não há necessidade de duplicar a criação da tabela 'usuarios' aqui.
-- Este arquivo pode ser mantido vazio ou removido se não houver outras tabelas de autenticação específicas.
