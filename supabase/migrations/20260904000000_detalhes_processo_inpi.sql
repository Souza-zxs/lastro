-- Guarda os campos ricos que só aparecem na página de DETALHE do
-- processo no INPI (nome/marca, titular, apresentação, natureza, classe)
-- — lib/inpi/cliente.ts agora segue o link de detalhe do resultado da
-- busca em vez de ler só a lista, pra poder mostrar isso no painel.
-- despacho_codigo nunca é preenchido por essa fonte (a tabela de
-- Publicações do INPI não expõe um código de despacho discreto, só RPI +
-- data + texto) — a coluna fica, sempre null, em vez de uma migration de
-- drop column só por isso.

alter table processos_inpi add column nome text;
alter table processos_inpi add column titular text;
alter table processos_inpi add column apresentacao text;
alter table processos_inpi add column natureza text;
alter table processos_inpi add column classe text;

-- As duas funções abaixo ganharam parâmetros novos, o que muda a
-- assinatura (tipos dos parâmetros) — sem o drop explícito,
-- `create or replace function` cria um OVERLOAD novo em vez de substituir
-- o antigo, deixando as duas versões coexistindo (mesmo padrão de
-- drop+recreate já usado em 20260720232000_auth_rls_credits.sql pra
-- criar_registro).
drop function if exists registrar_evento_processo_inpi(uuid, text, text, date, text, text, date);
drop function if exists marcar_processo_inpi_verificado(uuid, text, date);

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
