-- A policy "usuarios atualizam o proprio perfil" (20260720232000) libera
-- update na própria linha sem restringir colunas — então, sem esta trava,
-- qualquer usuário autenticado poderia chamar
-- `supabase.from('usuarios').update({ is_admin: true })` a partir do
-- próprio app e se autopromover a admin. Este trigger ignora qualquer
-- alteração de is_admin que não venha da service-role key (usada só em
-- código server-only, ex.: promoção manual pelo SQL editor).
create or replace function proteger_is_admin()
returns trigger
language plpgsql
as $$
begin
  if new.is_admin is distinct from old.is_admin and auth.role() <> 'service_role' then
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$;

create trigger protege_is_admin_update
  before update on usuarios
  for each row execute function proteger_is_admin();
