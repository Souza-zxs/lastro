-- Checkout real via Asaas: pedidos + confirmação de pagamento.
--
-- Substitui o stub de /api/checkout (que creditava na hora, sem cobrança
-- real) por um fluxo de duas pontas:
--   1. /api/checkout cria uma cobrança no Asaas e um `pedido` "pendente";
--   2. o webhook do Asaas confirma o pagamento e chama
--      confirmar_pagamento_pedido, que credita o usuário.
-- Nenhum crédito é concedido fora desse caminho — adicionar_creditos
-- (do stub anterior) continua existindo só por compatibilidade com o que
-- já foi concedido manualmente, mas o checkout novo não a chama mais.

alter table usuarios add column asaas_customer_id text;

create table pedidos (
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

create index pedidos_user_id_idx on pedidos (user_id);
create index pedidos_asaas_payment_id_idx on pedidos (asaas_payment_id);

alter table pedidos enable row level security;

-- RLS: cada usuário só enxerga os próprios pedidos. Não há policy de
-- insert/update — só a service-role (checkout e webhook, ambos
-- server-only) grava nessa tabela.
create policy "usuarios veem os proprios pedidos"
  on pedidos for select
  using (auth.uid() = user_id);

-- confirmar_pagamento_pedido: chamada pelo webhook do Asaas quando um
-- pagamento é confirmado. `for update` trava a linha do pedido durante a
-- transação, então duas notificações concorrentes pro mesmo pagamento
-- (retry do Asaas, ou o mesmo evento entregue duas vezes) não conseguem
-- creditar em duplicidade — a segunda espera a primeira liberar o lock e
-- então cai no `if v_pedido.status = 'pago'`, virando um no-op.
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
