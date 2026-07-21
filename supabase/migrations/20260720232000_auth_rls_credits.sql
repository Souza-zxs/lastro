-- Autenticação real (Supabase Auth) + RLS por usuário + créditos.
--
-- Substitui o acesso "tudo via service-role key + DEMO_USER_ID" por:
--   1. usuarios.id passa a ser o id do auth.users correspondente;
--   2. um trigger cria a linha em usuarios no cadastro;
--   3. policies de RLS restringem cada usuário aos próprios dados;
--   4. criar_registro usa auth.uid() em vez de receber o user_id como
--      parâmetro, então pode ser chamada pelo client autenticado comum
--      (não só pela service-role key);
--   5. verificar_registro expõe só a consulta pública por código, sem
--      liberar select geral em `registros` para o role anon;
--   6. adicionar_creditos é o ponto de entrada para conceder créditos após
--      uma compra (hoje chamado por um stub em /api/checkout; trocar pelo
--      webhook do gateway de pagamento real quando ele for integrado).

alter table usuarios
  add constraint usuarios_id_fkey foreign key (id) references auth.users (id) on delete cascade;

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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- RLS: cada usuário só enxerga e atualiza o próprio perfil. Não há policy
-- de insert porque a única forma de criar uma linha é via trigger acima
-- (security definer, roda com privilégios do dono da função).
create policy "usuarios veem o proprio perfil"
  on usuarios for select
  using (auth.uid() = id);

create policy "usuarios atualizam o proprio perfil"
  on usuarios for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- RLS: cada usuário só enxerga os próprios registros. Não há policy de
-- insert: a única forma de criar um registro é a função criar_registro
-- abaixo (security definer), que também garante a atomicidade do débito
-- de crédito.
create policy "usuarios veem os proprios registros"
  on registros for select
  using (auth.uid() = user_id);

-- criar_registro passa a usar auth.uid() em vez de receber o user_id como
-- parâmetro: assim qualquer usuário autenticado pode chamá-la diretamente,
-- mas só em nome de si mesmo — não é mais preciso passar pela
-- service-role key para registrar uma imagem.
drop function if exists criar_registro(uuid, text, text, text, text, text, text, bigint);

create or replace function criar_registro(
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
    hash_sha256, imagem_thumb, formato, dimensoes, tamanho_bytes
  ) values (
    v_user_id, v_codigo, p_titulo, p_categoria, v_autor, v_email,
    p_hash_sha256, p_imagem_thumb, p_formato, p_dimensoes, p_tamanho_bytes
  )
  returning * into v_registro;

  return v_registro;
end;
$$;

grant execute on function criar_registro(text, text, text, text, text, text, bigint) to authenticated;

-- verificar_registro: consulta pública por código de verificação, sem
-- expor a tabela inteira ao role anon.
create or replace function verificar_registro(p_codigo text)
returns setof registros
language sql
security definer
set search_path = public
as $$
  select * from registros where codigo_verificacao = upper(p_codigo);
$$;

grant execute on function verificar_registro(text) to anon, authenticated;

-- adicionar_creditos: só a service-role pode chamar. Usado hoje pelo stub
-- de checkout em /api/checkout; trocar por uma chamada a partir do
-- webhook do gateway de pagamento real quando ele for integrado.
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

-- Storage: upload de thumbnail só na própria pasta do usuário autenticado
-- (thumbnails/{user_id}/arquivo.jpg). Leitura pública já é garantida pelo
-- bucket público criado na migration anterior.
create policy "usuarios enviam suas proprias thumbnails"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'thumbnails'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
