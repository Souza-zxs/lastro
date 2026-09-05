-- CMS leve: guarda só os textos que o admin sobrescreveu pelo painel
-- (/admin/conteudo). Os valores padrão continuam vivendo no código
-- (lib/conteudo.ts) — uma chave sem linha aqui simplesmente usa o padrão,
-- então o site funciona normalmente mesmo sem nenhuma edição.

create table conteudos_site (
  chave text primary key,
  valor text not null,
  atualizado_em timestamptz not null default now()
);

alter table conteudos_site enable row level security;

-- Conteúdo do site é público por natureza (aparece pra qualquer
-- visitante). Só a service-role (usada pelo painel admin) grava.
create policy "conteudo do site e publico"
  on conteudos_site for select
  using (true);
