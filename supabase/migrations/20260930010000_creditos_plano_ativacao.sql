-- BUG: ativar_plano_usuario nunca alocava os créditos mensais do plano —
-- só atualizava plano_id/plano_ciclo/plano_ativado_em. Isso afeta tanto o
-- webhook real da Greenn (toda ativação/renovação de assinatura) quanto o
-- "Alterar plano" do painel admin, que chamam a mesma função. Assinantes
-- pagantes não estavam recebendo os créditos do plano.
--
-- creditos_por_mes passa a viver em `planos` (mesma ideia de
-- processos_inpi_inclusos: fonte de verdade no banco, espelhada em
-- lib/planos.ts pra exibição — manter os dois em sync ao mudar um plano).
--
-- Aditivo, não substitui o saldo: soma ao que já existe em vez de
-- "resetar" pro valor do plano, pra nunca apagar créditos avulsos
-- comprados à parte (que não expiram). Isso significa que uma renovação
-- soma de novo os créditos do mês — aceitável dado que o webhook já é
-- deduplicado por (venda_id, status), então não deve rodar mais de uma
-- vez por ciclo real de cobrança.

alter table planos add column creditos_por_mes integer not null default 0;

update planos set creditos_por_mes = 8 where id = 'essencial';
update planos set creditos_por_mes = 20 where id = 'estudio';
update planos set creditos_por_mes = 50 where id = 'portfolio';

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
  v_creditos_por_mes integer;
begin
  if p_plano_id = 'estudio' and p_ciclo = 'anual' then
    v_bonus_processos := 15;
  end if;

  select creditos_por_mes into v_creditos_por_mes from planos where id = p_plano_id;

  update usuarios
    set plano_id = p_plano_id,
        plano_ciclo = p_ciclo,
        plano_processos_bonus = v_bonus_processos,
        plano_ativado_em = now(),
        creditos_disponiveis = creditos_disponiveis + coalesce(v_creditos_por_mes, 0)
    where id = p_user_id;
end;
$$;
