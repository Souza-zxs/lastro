-- Acompanhamento de processos do INPI: além de provar anterioridade de
-- imagens, o Lastro passa a acompanhar processos que o usuário já
-- depositou no INPI (marca, patente, desenho industrial) e avisar quando
-- o status/despacho mudar. Mesmo desenho do monitoramento de uso indevido
-- (20260721000000_monitoramento_uso_indevido.sql): uma tabela de estado
-- atual (`processos_inpi`) + uma tabela de eventos append-only
-- (`eventos_processo_inpi`), com RPCs security-definer pra escrita.
--
-- Fonte dos dados: não existe API oficial do INPI. `lib/inpi/cliente.ts`
-- consulta o portal público de busca (pePI, busca.inpi.gov.br) de forma
-- anônima, sem chave de API — por isso não há nenhuma env var nova aqui.

create table processos_inpi (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references usuarios (id) on delete cascade,
  numero_processo text not null,
  tipo text not null check (tipo in ('marca', 'patente', 'desenho_industrial')),
  apelido text,
  situacao text,
  despacho_codigo text,
  despacho_descricao text,
  despacho_data date,
  numero_rpi text,
  dados_atualizados_ate date,
  ultima_verificacao_em timestamptz,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, numero_processo, tipo)
);

create table eventos_processo_inpi (
  id uuid primary key default gen_random_uuid(),
  processo_id uuid not null references processos_inpi (id) on delete cascade,
  user_id uuid not null references usuarios (id) on delete cascade,
  despacho_codigo text,
  despacho_descricao text not null,
  despacho_data date,
  situacao text,
  encontrado_em timestamptz not null default now(),
  lido boolean not null default false,
  created_at timestamptz not null default now()
);

create index processos_inpi_user_id_idx on processos_inpi (user_id);
create index processos_inpi_ativo_idx on processos_inpi (ativo);
create index eventos_processo_inpi_user_id_idx on eventos_processo_inpi (user_id);
create index eventos_processo_inpi_processo_id_idx on eventos_processo_inpi (processo_id);

alter table processos_inpi enable row level security;
alter table eventos_processo_inpi enable row level security;

-- RLS: cada usuário vê e edita (apelido/ativo) só os próprios processos, e
-- pode removê-los diretamente — ao contrário de crédito, isso não é uma
-- operação sensível. Não há policy de insert: a única forma de criar um
-- processo é criar_processo_inpi abaixo (security definer).
create policy "usuarios veem os proprios processos inpi"
  on processos_inpi for select
  using (auth.uid() = user_id);

create policy "usuarios atualizam os proprios processos inpi"
  on processos_inpi for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "usuarios removem os proprios processos inpi"
  on processos_inpi for delete
  using (auth.uid() = user_id);

-- RLS: cada usuário só enxerga os próprios eventos e só pode marcar como
-- lido (`lido`) — criação é só via registrar_evento_processo_inpi
-- (chamada pelo job com a service-role key).
create policy "usuarios veem os proprios eventos de processo inpi"
  on eventos_processo_inpi for select
  using (auth.uid() = user_id);

create policy "usuarios marcam como lido os proprios eventos"
  on eventos_processo_inpi for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- criar_processo_inpi: único jeito de inserir em processos_inpi. Usa
-- auth.uid(), então qualquer usuário autenticado pode chamar diretamente
-- em nome de si mesmo (mesmo padrão de criar_registro).
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
  v_processo processos_inpi;
begin
  if v_user_id is null then
    raise exception 'nao_autenticado';
  end if;

  insert into processos_inpi (user_id, numero_processo, tipo, apelido)
  values (v_user_id, p_numero_processo, p_tipo, p_apelido)
  returning * into v_processo;

  return v_processo;
end;
$$;

grant execute on function criar_processo_inpi(text, text, text) to authenticated;

-- registrar_evento_processo_inpi: único jeito de inserir em
-- eventos_processo_inpi. Resolve o user_id a partir do processo (nunca
-- confia num user_id vindo de fora) e atualiza o snapshot em
-- processos_inpi na mesma transação, pra estado atual e histórico nunca
-- ficarem inconsistentes entre si.
create or replace function registrar_evento_processo_inpi(
  p_processo_id uuid,
  p_despacho_codigo text,
  p_despacho_descricao text,
  p_despacho_data date,
  p_situacao text,
  p_numero_rpi text default null,
  p_dados_atualizados_ate date default null
)
returns eventos_processo_inpi
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_evento eventos_processo_inpi;
begin
  select user_id into v_user_id from processos_inpi where id = p_processo_id;
  if not found then
    raise exception 'processo_nao_encontrado';
  end if;

  insert into eventos_processo_inpi (processo_id, user_id, despacho_codigo, despacho_descricao, despacho_data, situacao)
  values (p_processo_id, v_user_id, p_despacho_codigo, p_despacho_descricao, p_despacho_data, p_situacao)
  returning * into v_evento;

  update processos_inpi
    set situacao = p_situacao,
        despacho_codigo = p_despacho_codigo,
        despacho_descricao = p_despacho_descricao,
        despacho_data = p_despacho_data,
        numero_rpi = coalesce(p_numero_rpi, numero_rpi),
        dados_atualizados_ate = coalesce(p_dados_atualizados_ate, dados_atualizados_ate),
        ultima_verificacao_em = now()
    where id = p_processo_id;

  return v_evento;
end;
$$;

revoke execute on function registrar_evento_processo_inpi(uuid, text, text, date, text, text, date) from public, anon, authenticated;
grant execute on function registrar_evento_processo_inpi(uuid, text, text, date, text, text, date) to service_role;

-- marcar_processo_inpi_verificado: usada pelo job quando a consulta rodou
-- mas não achou nenhuma mudança — só atualiza ultima_verificacao_em (e,
-- se disponíveis, numero_rpi/dados_atualizados_ate), sem criar evento.
create or replace function marcar_processo_inpi_verificado(
  p_processo_id uuid,
  p_numero_rpi text default null,
  p_dados_atualizados_ate date default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update processos_inpi
    set ultima_verificacao_em = now(),
        numero_rpi = coalesce(p_numero_rpi, numero_rpi),
        dados_atualizados_ate = coalesce(p_dados_atualizados_ate, dados_atualizados_ate)
    where id = p_processo_id;
end;
$$;

revoke execute on function marcar_processo_inpi_verificado(uuid, text, date) from public, anon, authenticated;
grant execute on function marcar_processo_inpi_verificado(uuid, text, date) to service_role;
