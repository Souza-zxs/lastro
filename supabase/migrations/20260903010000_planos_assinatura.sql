-- Assinatura por plano (Essencial/Estúdio/Portfólio, ver lib/planos.ts):
-- até aqui o acompanhamento de processos do INPI era de graça pra
-- qualquer usuário logado, sem limite nenhum. Passa a exigir um plano
-- ativo, com um número máximo de processos simultâneos por plano (mais o
-- bônus de promoção, se houver).
--
-- O webhook da Greenn (gateway do checkout de assinatura, ver
-- lib/planos.ts) ainda não está implementado — `ativar_plano_usuario`
-- abaixo é o ponto de entrada que esse webhook vai chamar quando existir.
-- Até lá, só pode ser chamado com a service-role key (ex.: manualmente,
-- pelo SQL editor do Supabase).

create table planos (
  id text primary key,
  processos_inpi_inclusos integer not null
);

insert into planos (id, processos_inpi_inclusos) values
  ('essencial', 2),
  ('estudio', 5),
  ('portfolio', 15);

alter table planos enable row level security;

alter table usuarios add column plano_id text references planos (id);
alter table usuarios add column plano_ciclo text check (plano_ciclo in ('mensal', 'semestral', 'anual'));
alter table usuarios add column plano_processos_bonus integer not null default 0;
alter table usuarios add column plano_ativado_em timestamptz;

-- ativar_plano_usuario: liga/atualiza o plano de um usuário. Aplica a
-- promoção do Estúdio anual (15 processos de bônus, sem crédito extra)
-- toda vez que for chamada com esse plano+ciclo — inclusive numa
-- renovação, não só na primeira assinatura. Ajustar aqui se renovação
-- não dever repetir o bônus.
create or replace function ativar_plano_usuario(
  p_user_id uuid,
  p_plano_id text,
  p_ciclo text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bonus_processos integer := 0;
begin
  if p_plano_id = 'estudio' and p_ciclo = 'anual' then
    v_bonus_processos := 15;
  end if;

  update usuarios
    set plano_id = p_plano_id,
        plano_ciclo = p_ciclo,
        plano_processos_bonus = v_bonus_processos,
        plano_ativado_em = now()
    where id = p_user_id;
end;
$$;

revoke execute on function ativar_plano_usuario(uuid, text, text) from public, anon, authenticated;
grant execute on function ativar_plano_usuario(uuid, text, text) to service_role;

-- criar_processo_inpi passa a exigir plano ativo e checar o limite de
-- processos simultâneos (processos_inpi_inclusos do plano + bônus da
-- promoção, se houver) antes de inserir.
create or replace function criar_processo_inpi(
  p_numero_processo text,
  p_tipo text,
  p_apelido text default null
)
returns processos_inpi
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_plano_id text;
  v_bonus integer;
  v_limite integer;
  v_em_uso integer;
  v_processo processos_inpi;
begin
  if v_user_id is null then
    raise exception 'nao_autenticado';
  end if;

  select plano_id, plano_processos_bonus into v_plano_id, v_bonus
    from usuarios where id = v_user_id;

  if v_plano_id is null then
    raise exception 'sem_plano_ativo';
  end if;

  select processos_inpi_inclusos into v_limite from planos where id = v_plano_id;

  select count(*) into v_em_uso from processos_inpi where user_id = v_user_id and ativo = true;

  if v_em_uso >= (v_limite + coalesce(v_bonus, 0)) then
    raise exception 'limite_processos_atingido';
  end if;

  insert into processos_inpi (user_id, numero_processo, tipo, apelido)
  values (v_user_id, p_numero_processo, p_tipo, p_apelido)
  returning * into v_processo;

  return v_processo;
end;
$$;

grant execute on function criar_processo_inpi(text, text, text) to authenticated;
