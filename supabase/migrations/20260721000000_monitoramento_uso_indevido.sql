-- Monitoramento de uso indevido: além de carimbar a imagem, o produto
-- passa a vigiar a web procurando cópias dela e alertar o dono do
-- registro. Feature gated por usuarios.monitoramento_ativo (hoje ligado
-- por um stub, igual ao de créditos, até existir assinatura mensal real).
--
-- Como funciona:
--   1. No registro, o navegador calcula um hash perceptual (dHash) além
--      do SHA-256 — diferente do SHA-256, ele resiste a recompressão e
--      redimensionamento, então serve pra achar a MESMA imagem depois de
--      reupada em outro lugar (o SHA-256 muda completamente nesse caso).
--   2. Um job periódico (app/api/jobs/monitorar) varre os registros de
--      usuários com monitoramento ativo, chama um provedor de busca
--      reversa (TinEye/Google Vision/Bing — a escolha do provedor ainda
--      é uma decisão de negócio em aberto, ver lib/monitoramento/provedor.ts)
--      e grava os achados em `alertas_uso_indevido`.
--   3. O usuário revisa os alertas no painel e marca cada um como
--      ignorado (falso positivo/uso licenciado) ou em disputa/resolvido.

alter table registros add column hash_perceptual text;
alter table registros add column ultimo_scan_em timestamptz;
create index registros_hash_perceptual_idx on registros (hash_perceptual);

alter table usuarios add column monitoramento_ativo boolean not null default false;

create table alertas_uso_indevido (
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

create index alertas_uso_indevido_user_id_idx on alertas_uso_indevido (user_id);
create index alertas_uso_indevido_registro_id_idx on alertas_uso_indevido (registro_id);
create index alertas_uso_indevido_status_idx on alertas_uso_indevido (status);

alter table alertas_uso_indevido enable row level security;

-- RLS: cada usuário só enxerga os próprios alertas e só pode mudar o
-- `status` deles (revisar/ignorar/disputar) — não pode criar nem apagar
-- um alerta diretamente. A criação é só via registrar_alerta_uso_indevido
-- (chamada pelo job com a service-role key).
create policy "usuarios veem os proprios alertas"
  on alertas_uso_indevido for select
  using (auth.uid() = user_id);

create policy "usuarios atualizam o status dos proprios alertas"
  on alertas_uso_indevido for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- criar_registro passa a receber também o hash perceptual (opcional —
-- default null preserva compatibilidade caso algo ainda chame a
-- assinatura antiga).
drop function if exists criar_registro(text, text, text, text, text, text, bigint);

create or replace function criar_registro(
  p_titulo text,
  p_categoria text,
  p_hash_sha256 text,
  p_imagem_thumb text,
  p_formato text,
  p_dimensoes text,
  p_tamanho_bytes bigint,
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
  v_codigo text;
  v_registro registros;
begin
  if v_user_id is null then
    raise exception 'nao_autenticado';
  end if;

  update usuarios
    set creditos_disponiveis = creditos_disponiveis - 1
    where id = v_user_id and creditos_disponiveis > 0
    returning nome, email into v_autor, v_email;

  if not found then
    raise exception 'creditos_insuficientes';
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
    hash_sha256, hash_perceptual, imagem_thumb, formato, dimensoes, tamanho_bytes
  ) values (
    v_user_id, v_codigo, p_titulo, p_categoria, v_autor, v_email,
    p_hash_sha256, p_hash_perceptual, p_imagem_thumb, p_formato, p_dimensoes, p_tamanho_bytes
  )
  returning * into v_registro;

  return v_registro;
end;
$$;

grant execute on function criar_registro(text, text, text, text, text, text, bigint, text) to authenticated;

-- registrar_alerta_uso_indevido: único jeito de inserir em
-- alertas_uso_indevido. Resolve o user_id a partir do registro (nunca
-- confia num user_id vindo de fora) e ignora duplicata silenciosamente
-- (mesmo registro + mesma URL já alertados antes).
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
