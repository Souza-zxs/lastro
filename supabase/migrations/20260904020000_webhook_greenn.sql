-- Webhook da Greenn (gateway do checkout de assinatura, ver lib/planos.ts):
-- liga ativar_plano_usuario (criada em 20260903010000_planos_assinatura.sql)
-- a uma venda paga de verdade. A Greenn não assina nem manda token nenhum
-- sozinha — a única configuração exposta no painel dela é a "URL do
-- Webhook" (Produtos > editar produto > Conteúdos > Adicionar Conteúdo >
-- Sistema Externo > Webhook). A autenticação é feita por nós: colocar
-- ?token=<GREENN_WEBHOOK_TOKEN> na própria URL cadastrada lá — mesmo
-- token nos 9 produtos/ciclos, todos podem apontar para
-- /api/webhooks/greenn?token=... (ver app/api/webhooks/greenn/route.ts).

-- greenn_webhook_eventos: log bruto de tudo que a Greenn envia, com dedupe
-- por (venda_id, status) — a Greenn reenvia o mesmo evento em caso de
-- timeout/erro do lado dela, e sem isso um reenvio duplicaria a ativação
-- do plano. Serve também para depurar o payload real (a documentação
-- pública da Greenn é escassa) e descobrir o product.id de cada produto
-- após a 1ª venda real, para popular greenn_produtos.
create table greenn_webhook_eventos (
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

-- Sem policies: só a service-role key (que ignora RLS) grava/lê esta
-- tabela, a partir do webhook. anon/authenticated não têm acesso nenhum.
alter table greenn_webhook_eventos enable row level security;

-- greenn_produtos: mapeamento opcional product_id (Greenn) -> plano+ciclo
-- (lib/planos.ts). Preenchido manualmente depois de confirmar o
-- product.id real em greenn_webhook_eventos.payload de uma venda de cada
-- um dos 9 produtos. Até lá (ou se uma linha faltar), o webhook tenta
-- inferir plano+ciclo pelo nome do produto cadastrado no painel da Greenn
-- (funciona se o nome contiver o nome do plano e o ciclo, ex. "Lastro
-- Estúdio Anual") — ver inferirPlanoECiclo em
-- app/api/webhooks/greenn/route.ts.
create table greenn_produtos (
  produto_id text primary key,
  plano_id text not null references planos (id),
  ciclo text not null check (ciclo in ('mensal', 'semestral', 'anual'))
);

alter table greenn_produtos enable row level security;
