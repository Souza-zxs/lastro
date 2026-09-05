-- Fecha 3 lacunas encontradas ao conferir o produto contra a checklist
-- jurídica de "Certificado de Anterioridade" passada pelo escritório:
--   1. CPF/CNPJ era opcional e sem uso obrigatório em lugar nenhum —
--      passa a ser exigido antes do primeiro registro (não no cadastro
--      da conta, pra não travar o onboarding: fica como pendência).
--   2. Endereço do titular nunca era coletado — mesma lógica do CPF.
--   3. O arquivo original nunca era armazenado (só a thumbnail
--      comprimida ia pro storage) — enfraquecia o próprio hash SHA-256,
--      que não tinha contra o que ser reconferido depois. Passa a
--      guardar o arquivo original enviado, num bucket privado.
-- Também grava a declaração de autoria (texto fixo, Lei 9.610/1998)
-- aceita no momento do registro.

alter table usuarios add column endereco text;

alter table registros add column autor_documento text;
alter table registros add column autor_endereco text;
alter table registros add column declaracao_autoria boolean not null default false;
alter table registros add column arquivo_original_path text;

-- Bucket privado (ao contrário de `thumbnails`, que é público): o
-- arquivo original não deve ser acessível por URL pública direta, só
-- pelo dono (ou service-role, se algum dia precisar reconferir hash
-- numa disputa).
insert into storage.buckets (id, name, public)
values ('originais', 'originais', false)
on conflict (id) do nothing;

create policy "usuarios enviam seus proprios arquivos originais"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'originais'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "usuarios leem seus proprios arquivos originais"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'originais'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- completar_dados_titular: único jeito de gravar documento/endereço a
-- partir do client autenticado comum — não há GRANT de UPDATE nessas
-- colunas pra `authenticated` (ver 20260721000001_grants_data_api.sql),
-- de propósito, seguindo o mesmo padrão das outras escritas sensíveis
-- do projeto (tudo por função security definer, nunca por PATCH direto
-- na tabela).
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

-- criar_registro passa a exigir documento/endereço já preenchidos e a
-- declaração de autoria aceita, copiando documento/endereço pro
-- próprio registro (fica congelado no que era o titular na hora do
-- registro, mesmo que o cadastro mude depois — mesmo espírito de
-- autor/email_autor).
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

-- verificar_registro (RPC pública, sem autenticação — usada pela página
-- /verificar/[codigo]) devolvia `select * from registros`, expondo em
-- texto plano pra qualquer visitante anônimo o e-mail do titular e,
-- agora que essas colunas passam a existir, também CPF/CNPJ e endereço.
-- Restringe o retorno só aos campos que fazem sentido numa verificação
-- pública (nada de PII além do nome do autor, que já era exibido).
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
