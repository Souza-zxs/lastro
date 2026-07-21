-- Dados de demonstração portados de data/mock-usuario.json e
-- data/mock-registros.json. Aplicado automaticamente por `supabase start`
-- e `supabase db reset`.
--
-- O usuário é criado direto em auth.users (não só em `usuarios`) para que
-- o login funcione de verdade em ambiente local:
--   e-mail:  camila.rocha@example.com
--   senha:   lastro-demo
-- O insert dispara o trigger on_auth_user_created, que já cria a linha em
-- `usuarios`; o update logo abaixo só ajusta plano/créditos/data para
-- bater com os dados de demonstração originais.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated',
  'authenticated',
  'camila.rocha@example.com',
  crypt('lastro-demo', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"nome":"Camila Rocha","documento":"123.456.789-00"}',
  now(),
  now(),
  '',
  ''
)
on conflict (id) do nothing;

update usuarios
set plano = 'Pacote 20 créditos', creditos_disponiveis = 14, membro_desde = '2026-02-03T00:00:00Z'
where id = '11111111-1111-1111-1111-111111111111';

insert into registros (
  user_id, codigo_verificacao, titulo, categoria, autor, email_autor,
  data_registro, hash_sha256, imagem_thumb, formato, dimensoes, tamanho_bytes, status
) values
(
  '11111111-1111-1111-1111-111111111111',
  '9F3A-7C1D-2B84',
  'Retrato Urbano — Série SP',
  'Fotografia',
  'Camila Rocha',
  'camila.rocha@example.com',
  '2026-06-15T14:32:00Z',
  'f3a1c9d84b2e7a05c6f19d3e88a2b4c7091fd5e3a6b8c0d2e4f61a7395c8b0d1',
  '/mock/imagem1-thumb.svg',
  'JPEG',
  '4000 × 6000 px',
  8912340,
  'confirmado'
),
(
  '11111111-1111-1111-1111-111111111111',
  '4D2E-A198-6F0B',
  'Dunas ao Amanhecer',
  'Ilustração',
  'Camila Rocha',
  'camila.rocha@example.com',
  '2026-06-02T09:14:00Z',
  '9b2e4f61a7395c8b0d1f3a1c9d84b2e7a05c6f19d3e88a2b4c7091fd5e3a6b8',
  '/mock/imagem2-thumb.svg',
  'PNG',
  '3200 × 2400 px',
  5204112,
  'confirmado'
),
(
  '11111111-1111-1111-1111-111111111111',
  '1A7C-3E90-BD45',
  'Macro — Folhagem Tropical',
  'Fotografia',
  'Camila Rocha',
  'camila.rocha@example.com',
  '2026-05-21T18:47:00Z',
  'a05c6f19d3e88a2b4c7091fd5e3a6b8c0d2e4f61a7395c8b0d1f3a1c9d84b2e7',
  '/mock/imagem3-thumb.svg',
  'JPEG',
  '5472 × 3648 px',
  11421008,
  'confirmado'
),
(
  '11111111-1111-1111-1111-111111111111',
  'C68F-05B2-9AE1',
  'Identidade Visual — Grade Modular',
  'Design',
  'Camila Rocha',
  'camila.rocha@example.com',
  '2026-07-08T11:03:00Z',
  '0d2e4f61a7395c8b0d1f3a1c9d84b2e7a05c6f19d3e88a2b4c7091fd5e3a6b8c',
  '/mock/imagem4-thumb.svg',
  'PNG',
  '2480 × 3508 px',
  3877264,
  'processando'
),
(
  '11111111-1111-1111-1111-111111111111',
  '7E21-D8F4-30CA',
  'Serra Noturna',
  'Fotografia',
  'Camila Rocha',
  'camila.rocha@example.com',
  '2026-04-30T22:58:00Z',
  'c7091fd5e3a6b8c0d2e4f61a7395c8b0d1f3a1c9d84b2e7a05c6f19d3e88a2b4',
  '/mock/imagem5-thumb.svg',
  'JPEG',
  '6000 × 4000 px',
  9530556,
  'confirmado'
);
