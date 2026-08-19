# Lastro (Revollution Ideias)

Prova de anterioridade para imagens: o usuário envia um arquivo, geramos o
hash (SHA-256) e o carimbo de tempo do envio, e emitimos um certificado em
PDF com QR code de verificação pública — evidência de que a obra já existia,
com aquele autor, numa data específica.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + React 19 + TypeScript
- [Supabase](https://supabase.com) — Postgres, Auth e Storage (com RLS)
- Tailwind CSS 4 + shadcn/ui
- [Asaas](https://www.asaas.com) — cobranças do checkout de créditos, via webhook
- Google Cloud Vision (Web Detection) — monitoramento de uso indevido das imagens registradas
- [Resend](https://resend.com) — e-mail de resumo do monitoramento
- Deploy e cron jobs na [Vercel](https://vercel.com)

## Estrutura

```
app/
  (marketing)/    página inicial, preços, verificação pública de certificado
  (auth)/         login e cadastro
  (dashboard)/    área logada: registros, alertas de uso indevido
  certificado/    página pública do certificado (via QR code)
  api/
    checkout/     cria cobrança Asaas para compra de pacote de créditos
    webhooks/     recebe confirmação de pagamento do Asaas
    jobs/         monitorar — job agendado (Vercel Cron) que varre a web
                   atrás de cópias das imagens registradas
    registros/    CRUD de registros de imagem
lib/
  actions/        server actions
  supabase/       clientes Supabase (browser/server)
  monitoramento/  lógica do job de monitoramento de uso indevido
  asaas.ts        cliente da API do Asaas
  hash.ts         hash SHA-256 dos arquivos enviados
  phash.ts        perceptual hash, usado para achar cópias/variações
supabase/
  migrations/     schema e políticas de RLS do banco
```

## Rodando localmente

Pré-requisitos: Node 20+, uma conta Supabase (ou `supabase start` local).

```bash
npm install
cp .env.example .env.local   # preencha as variáveis, ver abaixo
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Variáveis de ambiente

Todas as variáveis, com instruções de onde obter cada uma, estão comentadas
em [`.env.example`](./.env.example). Resumo:

| Variável | Obrigatória | Para quê |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | sim | Banco, auth e storage |
| `NEXT_PUBLIC_SITE_URL` | sim | Monta a URL de verificação no QR code do certificado |
| `CRON_SECRET` | sim | Autoriza a chamada do Vercel Cron a `/api/jobs/monitorar` |
| `GOOGLE_VISION_API_KEY` | sim | Busca de cópias das imagens (monitoramento de uso indevido) |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | não | E-mail de resumo do monitoramento (sem elas, o job só não envia e-mail) |
| `ASAAS_API_KEY` / `ASAAS_ENV` / `ASAAS_WEBHOOK_TOKEN` | sim | Checkout de créditos e confirmação de pagamento via webhook |

## Deploy

O projeto está hospedado na Vercel (`daniel-4710s-projects/lastro`), com o
job de monitoramento agendado via `vercel.json` (`crons`). Deploy de produção:

```bash
npx vercel --prod
```

Configure as mesmas variáveis de ambiente da tabela acima no painel da
Vercel (Project Settings > Environment Variables) antes do primeiro deploy.

## Banco de dados

O schema e as políticas de RLS vivem em `supabase/migrations/`. Para aplicar:

```bash
supabase db push
```
