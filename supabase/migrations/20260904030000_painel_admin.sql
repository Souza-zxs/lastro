-- Painel administrativo: até aqui não existia nenhum conceito de "admin" no
-- sistema. is_admin marca manualmente (via SQL editor do Supabase, ex.:
-- `update usuarios set is_admin = true where email = '...'`) quem pode
-- acessar /admin. A leitura desse campo pelo próprio dono da conta já é
-- coberta pela policy "usuarios veem o proprio perfil" (RLS); as páginas
-- admin em si consultam com a service-role key (getSupabaseAdminClient),
-- que ignora RLS, então nenhuma policy nova é necessária para os admins
-- enxergarem os dados de todo mundo.

alter table usuarios add column is_admin boolean not null default false;
