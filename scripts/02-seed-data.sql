-- Inserir dados de exemplo na tabela de empresas
INSERT INTO empresas (id, nome_fantasia, razao_social, cnpj, setor_economico, setor_empresa, segmento, tema_segmento, municipio, endereco, apresentacao, descricao_produtos, instagram, status) VALUES
('1', 'AcreFoods Indústria', 'Acre Alimentos Ltda.', '00.000.000/0001-01', 'agroindustria', 'alimentos', 'processamento', 'alimentos regionais', 'Rio Branco', 'Rua das Palmeiras, 123, Centro', 'Líder na produção de alimentos orgânicos da Amazônia.', 'Produzimos polpas de frutas, castanhas e açaí.', '@acrefoods', 'ativo'),
('2', 'Madeira Nobre do Acre', 'M.N. Acre Madeireira S.A.', '00.000.000/0001-02', 'industria', 'madeira', 'beneficiamento', 'madeira sustentável', 'Cruzeiro do Sul', 'Av. Floresta, 456, Bairro Verde', 'Especializada em beneficiamento de madeira certificada.', 'Tábuas, vigas e pisos de madeira de lei.', '@madeiranobreac', 'ativo'),
('3', 'Cerâmica Acreana', 'C.A. Construções Ltda.', '00.000.000/0001-03', 'industria', 'construcao', 'materiais', 'construção civil', 'Sena Madureira', 'Rodovia BR-364, Km 10', 'Fabricante de telhas e tijolos ecológicos.', 'Telhas coloniais, tijolos de solo-cimento.', '@ceramicaacreana', 'pendente'),
('4', 'TecnoAcre Soluções', 'Tecnologia Acreana S.A.', '00.000.000/0001-04', 'servicos', 'tecnologia', 'software', 'soluções digitais', 'Rio Branco', 'Rua da Inovação, 789, Distrito Industrial', 'Desenvolvimento de softwares e sistemas para gestão industrial.', 'Sistemas ERP, CRM e automação industrial.', '@tecnoacre', 'ativo'),
('5', 'BioCosméticos Amazônia', 'B.C. Amazônia Ltda.', '00.000.000/0001-05', 'industria', 'outros', 'cosméticos', 'produtos naturais', 'Xapuri', 'Rua Chico Mendes, 100, Centro', 'Produção de cosméticos naturais com ingredientes da floresta.', 'Shampoos, sabonetes e cremes hidratantes.', '@biocosmeticosamz', 'inativo');

-- Inserir dados de exemplo na tabela de produtos
INSERT INTO produtos (id, empresa_id, nome, linha, descricao, status) VALUES
(gen_random_uuid(), '1', 'Polpa de Açaí Orgânica', 'Polpas de Frutas', 'Polpa de açaí 100% orgânica, sem conservantes.', 'ativo'),
(gen_random_uuid(), '1', 'Castanha do Brasil Torrada', 'Castanhas', 'Castanha do Brasil selecionada, torrada e salgada.', 'ativo'),
(gen_random_uuid(), '2', 'Piso de Ipê Certificado', 'Pisos de Madeira', 'Piso de madeira Ipê, com certificação de manejo sustentável.', 'ativo'),
(gen_random_uuid(), '3', 'Telha Colonial Ecológica', 'Telhas', 'Telha colonial produzida com materiais reciclados.', 'pendente'),
(gen_random_uuid(), '4', 'Sistema de Gestão Industrial', 'Software ERP', 'Software completo para gestão de processos industriais.', 'ativo');

-- Inserir dados de exemplo na tabela de arquivos
INSERT INTO arquivos (id, empresa_id, nome, url, tipo, categoria) VALUES
(gen_random_uuid(), '1', 'Certificado Orgânico AcreFoods', 'https://example.com/cert_acrefoods.pdf', 'pdf', 'certificacao'),
(gen_random_uuid(), '1', 'Logo AcreFoods', 'https://example.com/logo_acrefoods.png', 'imagem', 'institucional'),
(gen_random_uuid(), '2', 'Catálogo Madeira Nobre', 'https://example.com/catalogo_madeira.pdf', 'pdf', 'produto');

-- Inserir dados de exemplo na tabela de usuários
INSERT INTO usuarios (id, email, password_hash, tipo, empresa_id) VALUES
('admin-id', 'admin@example.com', 'hashed_admin_password', 'admin', NULL), -- Senha mock: admin123
('empresa-id', 'empresa@example.com', 'hashed_empresa_password', 'empresa', '1'); -- Senha mock: empresa123

-- Inserir dados de exemplo na tabela de analytics
INSERT INTO analytics (id, empresa_id, tipo_evento, referencia_id, timestamp) VALUES
(gen_random_uuid(), '1', 'visualizacao_perfil', NULL, NOW() - INTERVAL '5 days'),
(gen_random_uuid(), '1', 'visualizacao_perfil', NULL, NOW() - INTERVAL '3 days'),
(gen_random_uuid(), '1', 'visualizacao_produto', (SELECT id FROM produtos WHERE nome = 'Polpa de Açaí Orgânica' LIMIT 1), NOW() - INTERVAL '2 days'),
(gen_random_uuid(), '2', 'visualizacao_perfil', NULL, NOW() - INTERVAL '1 day');
