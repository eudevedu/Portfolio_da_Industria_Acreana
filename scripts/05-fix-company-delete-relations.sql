-- Execute no SQL Editor do Supabase do mesmo projeto usado pela aplicação.
-- Não exclui registros. Ajusta apenas as relações conhecidas com empresas.
-- Produtos, arquivos, analytics e visualizacoes: CASCADE.
-- Perfis e usuários: SET NULL, preservando contas até a limpeza pelo aplicativo.
BEGIN;

DO $migration$
DECLARE
  relation_name text;
  child_table regclass;
  company_column smallint;
  parent_column smallint;
  deletion_action text;
  update_action text;
  match_clause text;
  deferred_clause text;
  relation_constraint record;
  constraint_count integer;
BEGIN
  IF to_regclass('public.empresas') IS NULL THEN
    RAISE EXCEPTION 'A tabela public.empresas não existe neste projeto.';
  END IF;

  SELECT attnum INTO parent_column FROM pg_attribute
  WHERE attrelid = 'public.empresas'::regclass AND attname = 'id' AND NOT attisdropped;

  FOREACH relation_name IN ARRAY ARRAY['produtos', 'arquivos', 'analytics', 'visualizacoes', 'perfis_empresas', 'usuarios'] LOOP
    child_table := to_regclass(format('public.%I', relation_name));
    IF child_table IS NULL THEN
      CONTINUE;
    END IF;

    SELECT attnum INTO company_column FROM pg_attribute
    WHERE attrelid = child_table AND attname = 'empresa_id' AND NOT attisdropped;
    IF company_column IS NULL THEN
      RAISE EXCEPTION 'A tabela % não possui empresa_id; nenhuma alteração será aplicada.', relation_name;
    END IF;

    deletion_action := CASE WHEN relation_name IN ('perfis_empresas', 'usuarios')
      THEN 'SET NULL' ELSE 'CASCADE' END;
    IF deletion_action = 'SET NULL' THEN
      EXECUTE format('ALTER TABLE %s ALTER COLUMN empresa_id DROP NOT NULL', child_table);
    END IF;

    constraint_count := 0;
    FOR relation_constraint IN
      SELECT * FROM pg_constraint
      WHERE contype = 'f' AND conrelid = child_table
        AND confrelid = 'public.empresas'::regclass
        AND conkey = ARRAY[company_column]::smallint[]
        AND confkey = ARRAY[parent_column]::smallint[]
    LOOP
      constraint_count := constraint_count + 1;
      IF (deletion_action = 'CASCADE' AND relation_constraint.confdeltype::text = 'c')
         OR (deletion_action = 'SET NULL' AND relation_constraint.confdeltype::text = 'n') THEN
        CONTINUE;
      END IF;

      update_action := CASE relation_constraint.confupdtype
        WHEN 'r' THEN 'RESTRICT' WHEN 'c' THEN 'CASCADE'
        WHEN 'n' THEN 'SET NULL' WHEN 'd' THEN 'SET DEFAULT' ELSE 'NO ACTION' END;
      match_clause := CASE WHEN relation_constraint.confmatchtype = 'f' THEN 'MATCH FULL' ELSE 'MATCH SIMPLE' END;
      deferred_clause := CASE WHEN relation_constraint.condeferrable THEN
        CASE WHEN relation_constraint.condeferred THEN 'DEFERRABLE INITIALLY DEFERRED'
          ELSE 'DEFERRABLE INITIALLY IMMEDIATE' END ELSE 'NOT DEFERRABLE' END;

      EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', child_table, relation_constraint.conname);
      EXECUTE format(
        'ALTER TABLE %s ADD CONSTRAINT %I FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) %s ON DELETE %s ON UPDATE %s %s',
        child_table, relation_constraint.conname, match_clause, deletion_action, update_action, deferred_clause
      );
    END LOOP;

    IF constraint_count = 0 THEN
      EXECUTE format(
        'ALTER TABLE %s ADD CONSTRAINT %I FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE %s',
        child_table, relation_name || '_empresa_id_fkey', deletion_action
      );
    END IF;
  END LOOP;
END;
$migration$;

COMMIT;

-- Conferência: mostra também vínculos de outras tabelas, sem alterá-los.
SELECT child_ns.nspname AS schema_origem, child.relname AS tabela,
  relation.conname AS restricao, pg_get_constraintdef(relation.oid) AS definicao
FROM pg_constraint relation
JOIN pg_class child ON child.oid = relation.conrelid
JOIN pg_namespace child_ns ON child_ns.oid = child.relnamespace
WHERE relation.contype = 'f' AND relation.confrelid = 'public.empresas'::regclass
ORDER BY schema_origem, tabela, restricao;
