-- Concede acesso ao painel admin (usuarios.is_admin) às duas contas
-- existentes no momento em que o painel foi criado. Só roda uma vez —
-- promoções futuras são feitas manualmente pelo SQL editor do Supabase
-- (ver comentário em 20260904030000_painel_admin.sql).

update usuarios set is_admin = true;
