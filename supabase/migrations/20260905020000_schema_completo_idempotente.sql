-- =============================================================================
-- SCHEMA COMPLETO — Revollution Lastro
-- =============================================================================
-- Consolida as 16 migrations anteriores num único script IDEMPOTENTE:
-- seguro de rodar em QUALQUER estado de banco — vazio (setup novo, local,
-- staging, disaster recovery) ou já totalmente migrado (produção, onde
-- este arquivo foi aplicado e virou 100% no-op, sem alterar nada) — sem
-- dar erro de "já existe". Cada CREATE TABLE/ADD COLUMN/POLICY/TRIGGER
-- está protegido com IF NOT EXISTS ou um DROP...IF EXISTS antes.
--
-- Útil pra montar um ambiente novo (local/staging) numa tacada só, sem
-- precisar rodar os 16 arquivos anteriores em ordem. As migrations
-- individuais continuam existindo e sendo a fonte histórica de verdade —
-- este arquivo é o "estado final" consolidado, não substitui as outras.
-- =============================================================================

create extension if not exists pgcrypto;

-- =============================================================================
-- TABELAS
-- =============================================================================

create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null unique,
  documento text,
  plano text not null default 'Pacote 20 créditos',
  creditos_disponiveis integer not null default 0,
  membro_desde timestamptz not null default now(),
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_name = 'usuarios' and constraint_name = 'usuarios_id_fkey'
  ) then
    alter table usuarios
      add constraint usuarios_id_fkey foreign key (id) references auth.users (id) on delete cascade;
  end if;
end $$;

alter table usuarios add column if not exists monitoramento_ativo boolean not null default false;
alter table usuarios add column if not exists asaas_customer_id text;

create table if not exists planos (
  id text primary key,
  processos_inpi_inclusos integer not null
);

insert into planos (id, processos_inpi_inclusos) values
  ('essencial', 2),
  ('estudio', 5),
  ('portfolio', 15)
on conflict (id) do nothing;

alter table usuarios add column if not exists plano_id text references planos (id);
alter table usuarios add column if not exists plano_ciclo text check (plano_ciclo in ('mensal', 'semestral', 'anual'));
alter table usuarios add column if not exists plano_processos_bonus integer not null default 0;
alter table usuarios add column if not exists plano_ativado_em timestamptz;
alter table usuarios add column if not exists is_admin boolean not null default false;
alter table usuarios add column if not exists endereco text;

create table if not exists registros (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references usuarios (id) on delete restrict,
  codigo_verificacao text not null unique,
  titulo text not null,
  categoria text not null,
  autor text not null,
  email_autor text not null,
  data_registro timestamptz not null default now(),
  hash_sha256 text not null,
  imagem_thumb text not null,
  formato text not null,
  dimensoes text not null,
  tamanho_bytes bigint not null,
  status text not null default 'confirmado' check (status in ('confirmado', 'processando')),
  created_at timestamptz not null default now()
);

alter table registros add column if not exists hash_perceptual text;
alter table registros add column if not exists ultimo_scan_em timestamptz;
alter table registros add column if not exists autor_documento text;
alter table registros add column if not exists autor_endereco text;
alter table registros add column if not exists declaracao_autoria boolean not null default false;
alter table registros add column if not exists arquivo_original_path text;

create index if not exists registros_user_id_idx on registros (user_id);
create index if not exists registros_hash_sha256_idx on registros (hash_sha256);
create index if not exists registros_hash_perceptual_idx on registros (hash_perceptual);

create table if not exists alertas_uso_indevido (
  id uuid primary key default gen_random_uuid(),
  registro_id uuid not null references registros (id) on delete cascade,
  user_id uuid not null references usuarios (id) on delete cascade,
  url_encontrada text not null,
  dominio text not null,
  similaridade numeric(5, 2) not null check (similaridade >= 0 and similaridade <= 100),
  metodo text not null,
  status text not null default 'novo'
    check (status in ('novo', 'revisado', 'ignorado', 'em_disputa', 'resolvido')),
  encontrado_em timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (registro_id, url_encontrada)
);

create index if not exists alertas_uso_indevido_user_id_idx on alertas_uso_indevido (user_id);
create index if not exists alertas_uso_indevido_registro_id_idx on alertas_uso_indevido (registro_id);
create index if not exists alertas_uso_indevido_status_idx on alertas_uso_indevido (status);

create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references usuarios (id) on delete restrict,
  pacote_id text not null,
  quantidade_creditos integer not null,
  valor_centavos integer not null,
  asaas_payment_id text unique,
  status text not null default 'pendente' check (status in ('pendente', 'pago', 'cancelado')),
  created_at timestamptz not null default now(),
  pago_em timestamptz
);

create index if not exists pedidos_user_id_idx on pedidos (user_id);
create index if not exists pedidos_asaas_payment_id_idx on pedidos (asaas_payment_id);

create table if not exists greenn_webhook_eventos (
  id uuid primary key default gen_random_uuid(),
  venda_id text not null,
  evento text not null,
  status text not null,
  produto_id text,
  produto_nome text,
  email_cliente text,
  payload jsonb not null,
  processado boolean not null default false,
  erro text,
  recebido_em timestamptz not null default now(),
  unique (venda_id, status)
);

create table if not exists greenn_produtos (
  produto_id text primary key,
  plano_id text not null references planos (id),
  ciclo text not null check (ciclo in ('mensal', 'semestral', 'anual'))
);

create table if not exists processos_inpi (
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

alter table processos_inpi add column if not exists nome text;
alter table processos_inpi add column if not exists titular text;
alter table processos_inpi add column if not exists apresentacao text;
alter table processos_inpi add column if not exists natureza text;
alter table processos_inpi add column if not exists classe text;

create index if not exists processos_inpi_user_id_idx on processos_inpi (user_id);
create index if not exists processos_inpi_ativo_idx on processos_inpi (ativo);

create table if not exists eventos_processo_inpi (
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

create index if not exists eventos_processo_inpi_user_id_idx on eventos_processo_inpi (user_id);
create index if not exists eventos_processo_inpi_processo_id_idx on eventos_processo_inpi (processo_id);

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references usuarios (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_id_idx on push_subscriptions (user_id);

create table if not exists conteudos_site (
  chave text primary key,
  valor text not null,
  atualizado_em timestamptz not null default now()
);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

alter table usuarios enable row level security;
alter table registros enable row level security;
alter table alertas_uso_indevido enable row level security;
alter table pedidos enable row level security;
alter table planos enable row level security;
alter table greenn_webhook_eventos enable row level security;
alter table greenn_produtos enable row level security;
alter table processos_inpi enable row level security;
alter table eventos_processo_inpi enable row level security;
alter table push_subscriptions enable row level security;
alter table conteudos_site enable row level security;

drop policy if exists "usuarios veem o proprio perfil" on usuarios;
create policy "usuarios veem o proprio perfil"
  on usuarios for select
  using (auth.uid() = id);

drop policy if exists "usuarios atualizam o proprio perfil" on usuarios;
create policy "usuarios atualizam o proprio perfil"
  on usuarios for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "usuarios veem os proprios registros" on registros;
create policy "usuarios veem os proprios registros"
  on registros for select
  using (auth.uid() = user_id);

drop policy if exists "usuarios veem os proprios alertas" on alertas_uso_indevido;
create policy "usuarios veem os proprios alertas"
  on alertas_uso_indevido for select
  using (auth.uid() = user_id);

drop policy if exists "usuarios atualizam o status dos proprios alertas" on alertas_uso_indevido;
create policy "usuarios atualizam o status dos proprios alertas"
  on alertas_uso_indevido for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "usuarios veem os proprios pedidos" on pedidos;
create policy "usuarios veem os proprios pedidos"
  on pedidos for select
  using (auth.uid() = user_id);

drop policy if exists "usuarios veem os proprios processos inpi" on processos_inpi;
create policy "usuarios veem os proprios processos inpi"
  on processos_inpi for select
  using (auth.uid() = user_id);

drop policy if exists "usuarios atualizam os proprios processos inpi" on processos_inpi;
create policy "usuarios atualizam os proprios processos inpi"
  on processos_inpi for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "usuarios removem os proprios processos inpi" on processos_inpi;
create policy "usuarios removem os proprios processos inpi"
  on processos_inpi for delete
  using (auth.uid() = user_id);

drop policy if exists "usuarios veem os proprios eventos de processo inpi" on eventos_processo_inpi;
create policy "usuarios veem os proprios eventos de processo inpi"
  on eventos_processo_inpi for select
  using (auth.uid() = user_id);

drop policy if exists "usuarios marcam como lido os proprios eventos" on eventos_processo_inpi;
create policy "usuarios marcam como lido os proprios eventos"
  on eventos_processo_inpi for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "usuarios veem as proprias inscricoes de notificacao" on push_subscriptions;
create policy "usuarios veem as proprias inscricoes de notificacao"
  on push_subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists "usuarios criam as proprias inscricoes de notificacao" on push_subscriptions;
create policy "usuarios criam as proprias inscricoes de notificacao"
  on push_subscriptions for insert
  with check (auth.uid() = user_id);

drop policy if exists "usuarios atualizam as proprias inscricoes de notificacao" on push_subscriptions;
create policy "usuarios atualizam as proprias inscricoes de notificacao"
  on push_subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "usuarios removem as proprias inscricoes de notificacao" on push_subscriptions;
create policy "usuarios removem as proprias inscricoes de notificacao"
  on push_subscriptions for delete
  using (auth.uid() = user_id);

drop policy if exists "conteudo do site e publico" on conteudos_site;
create policy "conteudo do site e publico"
  on conteudos_site for select
  using (true);

-- =============================================================================
-- STORAGE
-- =============================================================================

insert into storage.buckets (id, name, public)
values ('thumbnails', 'thumbnails', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('originais', 'originais', false)
on conflict (id) do nothing;

drop policy if exists "usuarios enviam suas proprias thumbnails" on storage.objects;
create policy "usuarios enviam suas proprias thumbnails"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'thumbnails'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "usuarios enviam seus proprios arquivos originais" on storage.objects;
create policy "usuarios enviam seus proprios arquivos originais"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'originais'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "usuarios leem seus proprios arquivos originais" on storage.objects;
create policy "usuarios leem seus proprios arquivos originais"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'originais'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- =============================================================================
-- GRANTS (Data API / PostgREST)
-- =============================================================================

revoke all on usuarios, registros, alertas_uso_indevido from anon, authenticated;

grant select on usuarios to authenticated;
grant update (monitoramento_ativo) on usuarios to authenticated;

grant select on registros to authenticated;

grant select on alertas_uso_indevido to authenticated;
grant update (status) on alertas_uso_indevido to authenticated;

-- =============================================================================
-- FUNÇÕES
-- =============================================================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into usuarios (id, nome, email, documento, creditos_disponiveis)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'documento',
    1
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- criar_registro: versão final (10 parâmetros — declaração de autoria +
-- caminho do arquivo original). Faz drop de todas as assinaturas antigas
-- que já existiram ao longo do histórico, pra nunca deixar overload morto
-- para trás num banco que ainda não tinha essa função.
drop function if exists criar_registro(uuid, text, text, text, text, text, text, bigint);
drop function if exists criar_registro(text, text, text, text, text, text, bigint);
drop function if exists criar_registro(text, text, text, text, text, text, bigint, text);

create or replace function criar_registro(
  p_titulo text,
  p_categoria text,
  p_hash_sha256 text,
  p_imagem_thumb text,
  p_formato text,
  p_dimensoes text,
  p_tamanho_bytes bigint,
  p_declaracao_autoria boolean,
  p_arquivo_original_path text,
  p_hash_perceptual text default null
)
returns registros
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_autor text;
  v_email text;
  v_documento text;
  v_endereco text;
  v_codigo text;
  v_registro registros;
begin
  if v_user_id is null then
    raise exception 'nao_autenticado';
  end if;

  if not p_declaracao_autoria then
    raise exception 'declaracao_autoria_obrigatoria';
  end if;

  if p_arquivo_original_path is null or trim(p_arquivo_original_path) = '' then
    raise exception 'arquivo_original_obrigatorio';
  end if;

  update usuarios
    set creditos_disponiveis = creditos_disponiveis - 1
    where id = v_user_id and creditos_disponiveis > 0
    returning nome, email, documento, endereco into v_autor, v_email, v_documento, v_endereco;

  if not found then
    raise exception 'creditos_insuficientes';
  end if;

  if v_documento is null or v_endereco is null then
    raise exception 'dados_titular_incompletos';
  end if;

  loop
    v_codigo := upper(
      substr(md5(random()::text || clock_timestamp()::text), 1, 4) || '-' ||
      substr(md5(random()::text || clock_timestamp()::text), 1, 4) || '-' ||
      substr(md5(random()::text || clock_timestamp()::text), 1, 4)
    );
    exit when not exists (select 1 from registros where codigo_verificacao = v_codigo);
  end loop;

  insert into registros (
    user_id, codigo_verificacao, titulo, categoria, autor, email_autor,
    autor_documento, autor_endereco, hash_sha256, hash_perceptual, imagem_thumb,
    formato, dimensoes, tamanho_bytes, declaracao_autoria, arquivo_original_path
  ) values (
    v_user_id, v_codigo, p_titulo, p_categoria, v_autor, v_email,
    v_documento, v_endereco, p_hash_sha256, p_hash_perceptual, p_imagem_thumb,
    p_formato, p_dimensoes, p_tamanho_bytes, true, p_arquivo_original_path
  )
  returning * into v_registro;

  return v_registro;
end;
$$;

grant execute on function criar_registro(text, text, text, text, text, text, bigint, boolean, text, text) to authenticated;

-- verificar_registro: versão final (RPC pública sem autenticação) — só os
-- campos seguros de expor a qualquer visitante anônimo, sem PII (CPF,
-- endereço, e-mail).
drop function if exists verificar_registro(text);

create or replace function verificar_registro(p_codigo text)
returns table (
  id uuid,
  codigo_verificacao text,
  titulo text,
  categoria text,
  autor text,
  data_registro timestamptz,
  hash_sha256 text,
  imagem_thumb text,
  formato text,
  dimensoes text,
  tamanho_bytes bigint,
  status text
)
language sql
security definer
set search_path = public
as $$
  select
    id, codigo_verificacao, titulo, categoria, autor, data_registro,
    hash_sha256, imagem_thumb, formato, dimensoes, tamanho_bytes, status
  from registros where codigo_verificacao = upper(p_codigo);
$$;

grant execute on function verificar_registro(text) to anon, authenticated;

create or replace function adicionar_creditos(p_user_id uuid, p_quantidade integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update usuarios
    set creditos_disponiveis = creditos_disponiveis + p_quantidade
    where id = p_user_id;
end;
$$;

revoke execute on function adicionar_creditos(uuid, integer) from public, anon, authenticated;
grant execute on function adicionar_creditos(uuid, integer) to service_role;

create or replace function confirmar_pagamento_pedido(p_asaas_payment_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pedido pedidos;
begin
  select * into v_pedido
    from pedidos
    where asaas_payment_id = p_asaas_payment_id
    for update;

  if not found then
    raise exception 'pedido_nao_encontrado';
  end if;

  if v_pedido.status = 'pago' then
    return;
  end if;

  update pedidos
    set status = 'pago', pago_em = now()
    where id = v_pedido.id;

  update usuarios
    set creditos_disponiveis = creditos_disponiveis + v_pedido.quantidade_creditos
    where id = v_pedido.user_id;
end;
$$;

revoke execute on function confirmar_pagamento_pedido(text) from public, anon, authenticated;
grant execute on function confirmar_pagamento_pedido(text) to service_role;

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

-- registrar_evento_processo_inpi: versão final (12 parâmetros — inclui os
-- campos ricos de detalhe do processo).
drop function if exists registrar_evento_processo_inpi(uuid, text, text, date, text, text, date);
drop function if exists registrar_evento_processo_inpi(uuid, text, text, date, text, text, date, text, text, text, text, text);

create or replace function registrar_evento_processo_inpi(
  p_processo_id uuid,
  p_despacho_codigo text,
  p_despacho_descricao text,
  p_despacho_data date,
  p_situacao text,
  p_numero_rpi text default null,
  p_dados_atualizados_ate date default null,
  p_nome text default null,
  p_titular text default null,
  p_apresentacao text default null,
  p_natureza text default null,
  p_classe text default null
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
        nome = coalesce(p_nome, nome),
        titular = coalesce(p_titular, titular),
        apresentacao = coalesce(p_apresentacao, apresentacao),
        natureza = coalesce(p_natureza, natureza),
        classe = coalesce(p_classe, classe),
        ultima_verificacao_em = now()
    where id = p_processo_id;

  return v_evento;
end;
$$;

revoke execute on function registrar_evento_processo_inpi(uuid, text, text, date, text, text, date, text, text, text, text, text) from public, anon, authenticated;
grant execute on function registrar_evento_processo_inpi(uuid, text, text, date, text, text, date, text, text, text, text, text) to service_role;

-- marcar_processo_inpi_verificado: versão final (8 parâmetros).
drop function if exists marcar_processo_inpi_verificado(uuid, text, date);
drop function if exists marcar_processo_inpi_verificado(uuid, text, date, text, text, text, text, text);

create or replace function marcar_processo_inpi_verificado(
  p_processo_id uuid,
  p_numero_rpi text default null,
  p_dados_atualizados_ate date default null,
  p_nome text default null,
  p_titular text default null,
  p_apresentacao text default null,
  p_natureza text default null,
  p_classe text default null
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
        dados_atualizados_ate = coalesce(p_dados_atualizados_ate, dados_atualizados_ate),
        nome = coalesce(p_nome, nome),
        titular = coalesce(p_titular, titular),
        apresentacao = coalesce(p_apresentacao, apresentacao),
        natureza = coalesce(p_natureza, natureza),
        classe = coalesce(p_classe, classe)
    where id = p_processo_id;
end;
$$;

revoke execute on function marcar_processo_inpi_verificado(uuid, text, date, text, text, text, text, text) from public, anon, authenticated;
grant execute on function marcar_processo_inpi_verificado(uuid, text, date, text, text, text, text, text) to service_role;

create or replace function registrar_alerta_uso_indevido(
  p_registro_id uuid,
  p_url_encontrada text,
  p_dominio text,
  p_similaridade numeric,
  p_metodo text
)
returns alertas_uso_indevido
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_alerta alertas_uso_indevido;
begin
  select user_id into v_user_id from registros where id = p_registro_id;
  if not found then
    raise exception 'registro_nao_encontrado';
  end if;

  insert into alertas_uso_indevido (registro_id, user_id, url_encontrada, dominio, similaridade, metodo)
  values (p_registro_id, v_user_id, p_url_encontrada, p_dominio, p_similaridade, p_metodo)
  on conflict (registro_id, url_encontrada) do nothing
  returning * into v_alerta;

  return v_alerta;
end;
$$;

revoke execute on function registrar_alerta_uso_indevido(uuid, text, text, numeric, text) from public, anon, authenticated;
grant execute on function registrar_alerta_uso_indevido(uuid, text, text, numeric, text) to service_role;

create or replace function completar_dados_titular(p_documento text, p_endereco text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'nao_autenticado';
  end if;

  if p_documento !~ '^[0-9]{11}$' and p_documento !~ '^[0-9]{14}$' then
    raise exception 'documento_invalido';
  end if;

  if p_endereco is null or length(trim(p_endereco)) < 5 then
    raise exception 'endereco_invalido';
  end if;

  update usuarios
    set documento = p_documento, endereco = trim(p_endereco)
    where id = v_user_id;
end;
$$;

grant execute on function completar_dados_titular(text, text) to authenticated;

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

drop trigger if exists protege_is_admin_update on usuarios;
create trigger protege_is_admin_update
  before update on usuarios
  for each row execute function proteger_is_admin();
