-- Guarda o nome original do arquivo enviado (ex.: "IMG_1751.jpeg"), pra
-- exibir no certificado — reforça o vínculo entre o hash e um arquivo
-- reconhecível pelo titular, no mesmo espírito do restante da checklist
-- de "Certificado de Anterioridade" (ver 20260905010000).

alter table registros add column arquivo_original_nome text;

drop function if exists criar_registro(text, text, text, text, text, text, bigint, boolean, text, text);

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
  p_arquivo_original_nome text default null,
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
    formato, dimensoes, tamanho_bytes, declaracao_autoria, arquivo_original_path,
    arquivo_original_nome
  ) values (
    v_user_id, v_codigo, p_titulo, p_categoria, v_autor, v_email,
    v_documento, v_endereco, p_hash_sha256, p_hash_perceptual, p_imagem_thumb,
    p_formato, p_dimensoes, p_tamanho_bytes, true, p_arquivo_original_path,
    p_arquivo_original_nome
  )
  returning * into v_registro;

  return v_registro;
end;
$$;

grant execute on function criar_registro(text, text, text, text, text, text, bigint, boolean, text, text, text) to authenticated;
