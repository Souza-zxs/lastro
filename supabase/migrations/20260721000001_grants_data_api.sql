-- Grants de acesso à Data API (PostgREST) para as tabelas usadas
-- diretamente pelo app via `.from(...)`.
--
-- `supabase/config.toml` tem `auto_expose_new_tables` comentado (o
-- comentário do próprio arquivo diz que isso "matching the new cloud
-- default"): tabelas novas do schema `public` deixaram de ser expostas
-- automaticamente aos roles anon/authenticated sem GRANT explícito. Sem
-- este arquivo, mesmo com as policies de RLS corretas, toda query direta
-- (`supabase.from("usuarios")...`) falharia com "permission denied for
-- table" em vez de simplesmente ser filtrada pela RLS — um erro que só
-- aparece rodando contra um Postgres de verdade, nunca em `tsc`/`build`.
--
-- REVOKE ALL primeiro remove qualquer dúvida sobre privilégio padrão que a
-- plataforma (local ou cloud) possa ter concedido nos bastidores antes
-- destas migrations rodarem — não queremos depender de um comportamento
-- ambíguo de exposição automática nem para o lado "faltando" nem para o
-- lado "sobrando" acesso.
--
-- IMPORTANTE: update é concedido só nas colunas específicas que o app
-- atualiza direto via client autenticado (não pela função security
-- definer). A RLS só filtra por LINHA (auth.uid() = id/user_id) — sem essa
-- restrição por COLUNA, qualquer usuário logado poderia enviar um PATCH
-- direto pra API REST alterando `creditos_disponiveis` pra qualquer valor,
-- pulando inteiramente o débito atômico de crédito em `criar_registro`.
revoke all on usuarios, registros, alertas_uso_indevido from anon, authenticated;

grant select on usuarios to authenticated;
grant update (monitoramento_ativo) on usuarios to authenticated;

grant select on registros to authenticated;

grant select on alertas_uso_indevido to authenticated;
grant update (status) on alertas_uso_indevido to authenticated;
