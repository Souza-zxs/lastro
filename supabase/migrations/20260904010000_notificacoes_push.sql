-- Notificações push (Web Push): o Lastro passa a ser instalável como PWA
-- (tela inicial do celular — ver app/manifest.ts) e quem instalar pode
-- ativar notificação de mudança de status/despacho de processo do INPI,
-- complementando o e-mail já existente. No iOS, a Apple só permite Web
-- Push depois que o site foi adicionado à tela inicial — por isso o card
-- de instalação e o botão de notificação andam juntos na UI
-- (components/CardAppMobile.tsx).

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references usuarios (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index push_subscriptions_user_id_idx on push_subscriptions (user_id);

alter table push_subscriptions enable row level security;

-- RLS: dado de baixa sensibilidade (só um endpoint de push, não
-- crédito/pagamento), então diferente de criar_registro/criar_processo_inpi
-- não precisa de RPC security-definer — cada usuário insere/remove/vê
-- direto as próprias inscrições.
create policy "usuarios veem as proprias inscricoes de notificacao"
  on push_subscriptions for select
  using (auth.uid() = user_id);

create policy "usuarios criam as proprias inscricoes de notificacao"
  on push_subscriptions for insert
  with check (auth.uid() = user_id);

-- Necessária pro upsert por `endpoint` em /api/push/subscribe (resubscrever
-- o mesmo endpoint deve atualizar as chaves, não falhar).
create policy "usuarios atualizam as proprias inscricoes de notificacao"
  on push_subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "usuarios removem as proprias inscricoes de notificacao"
  on push_subscriptions for delete
  using (auth.uid() = user_id);
