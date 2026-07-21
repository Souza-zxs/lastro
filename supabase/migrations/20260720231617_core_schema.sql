-- Núcleo do produto: usuários, registros e função atômica de criação de registro.

create extension if not exists pgcrypto;

create table usuarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null unique,
  documento text,
  plano text not null default 'Pacote 20 créditos',
  creditos_disponiveis integer not null default 0,
  membro_desde timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table registros (
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

create index registros_user_id_idx on registros (user_id);
create index registros_hash_sha256_idx on registros (hash_sha256);

-- RLS habilitado sem nenhuma policy: todo acesso passa pela service-role key,
-- usada só em código server-only. Nada a "destravar" quando entrar auth real
-- — as próximas policies serão adicionadas, não removidas.
alter table usuarios enable row level security;
alter table registros enable row level security;

-- Decrementa crédito e insere o registro na mesma transação, evitando
-- qualquer race entre checar e debitar créditos. Também gera e garante a
-- unicidade do código de verificação.
create or replace function criar_registro(
  p_user_id uuid,
  p_titulo text,
  p_categoria text,
  p_hash_sha256 text,
  p_imagem_thumb text,
  p_formato text,
  p_dimensoes text,
  p_tamanho_bytes bigint
)
returns registros
language plpgsql
as $$
declare
  v_autor text;
  v_email text;
  v_codigo text;
  v_registro registros;
begin
  update usuarios
    set creditos_disponiveis = creditos_disponiveis - 1
    where id = p_user_id and creditos_disponiveis > 0
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
    hash_sha256, imagem_thumb, formato, dimensoes, tamanho_bytes
  ) values (
    p_user_id, v_codigo, p_titulo, p_categoria, v_autor, v_email,
    p_hash_sha256, p_imagem_thumb, p_formato, p_dimensoes, p_tamanho_bytes
  )
  returning * into v_registro;

  return v_registro;
end;
$$;
