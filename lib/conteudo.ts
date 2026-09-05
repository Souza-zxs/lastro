import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface CampoConteudo {
  chave: string;
  secao: string;
  secaoLabel: string;
  label: string;
  padrao: string;
  tipo: "texto" | "textarea";
}

export const CAMPOS_CONTEUDO: CampoConteudo[] = [
  // Página inicial
  {
    chave: "landing.hero.eyebrow",
    secao: "landing",
    secaoLabel: "Página inicial",
    label: "Selo acima do título",
    padrao: "Prova de anterioridade para imagens",
    tipo: "texto",
  },
  {
    chave: "landing.hero.titulo",
    secao: "landing",
    secaoLabel: "Página inicial",
    label: "Título principal",
    padrao: "Registre a autoria da sua imagem antes que alguém duvide dela.",
    tipo: "texto",
  },
  {
    chave: "landing.hero.subtitulo",
    secao: "landing",
    secaoLabel: "Página inicial",
    label: "Subtítulo do topo",
    padrao:
      "Revollution Lastro gera um carimbo de tempo e um certificado verificável para cada imagem que você registra — sua evidência de que a obra já existia, com o seu nome, numa data específica.",
    tipo: "textarea",
  },
  {
    chave: "landing.comoFunciona.titulo",
    secao: "landing",
    secaoLabel: "Página inicial",
    label: "Título da seção \"Como funciona\"",
    padrao: "Do arquivo ao certificado, em quatro etapas.",
    tipo: "texto",
  },
  {
    chave: "landing.passo1.titulo",
    secao: "landing",
    secaoLabel: "Página inicial",
    label: "Passo 1 — título",
    padrao: "Envie a imagem",
    tipo: "texto",
  },
  {
    chave: "landing.passo1.texto",
    secao: "landing",
    secaoLabel: "Página inicial",
    label: "Passo 1 — texto",
    padrao:
      "Faça upload do arquivo final — foto, ilustração ou peça de design. Fica só com você; usamos apenas para gerar a prova.",
    tipo: "textarea",
  },
  {
    chave: "landing.passo2.titulo",
    secao: "landing",
    secaoLabel: "Página inicial",
    label: "Passo 2 — título",
    padrao: "Geramos o hash e o carimbo de tempo",
    tipo: "texto",
  },
  {
    chave: "landing.passo2.texto",
    secao: "landing",
    secaoLabel: "Página inicial",
    label: "Passo 2 — texto",
    padrao: "Calculamos o SHA-256 do arquivo e registramos data e hora do envio. Esse par é a evidência de anterioridade.",
    tipo: "textarea",
  },
  {
    chave: "landing.passo3.titulo",
    secao: "landing",
    secaoLabel: "Página inicial",
    label: "Passo 3 — título",
    padrao: "Emitimos o certificado",
    tipo: "texto",
  },
  {
    chave: "landing.passo3.texto",
    secao: "landing",
    secaoLabel: "Página inicial",
    label: "Passo 3 — texto",
    padrao:
      "Um documento com seus dados, o hash, o carimbo e um QR code de verificação, pronto para baixar ou anexar a um processo.",
    tipo: "textarea",
  },
  {
    chave: "landing.passo4.titulo",
    secao: "landing",
    secaoLabel: "Página inicial",
    label: "Passo 4 — título",
    padrao: "Qualquer pessoa pode conferir",
    tipo: "texto",
  },
  {
    chave: "landing.passo4.texto",
    secao: "landing",
    secaoLabel: "Página inicial",
    label: "Passo 4 — texto",
    padrao:
      "Compartilhe o código de verificação. Quem receber confere a autenticidade numa página pública, sem precisar de conta.",
    tipo: "textarea",
  },
  {
    chave: "landing.paraQuem.titulo",
    secao: "landing",
    secaoLabel: "Página inicial",
    label: "Título da seção \"Para quem é\"",
    padrao: "Feito para quem vive de criar imagens.",
    tipo: "texto",
  },
  {
    chave: "landing.paraQuem.subtitulo",
    secao: "landing",
    secaoLabel: "Página inicial",
    label: "Texto da seção \"Para quem é\"",
    padrao: "Se o seu trabalho pode ser copiado com um clique direito, vale ter uma prova de quando ele nasceu.",
    tipo: "textarea",
  },
  {
    chave: "landing.cta.titulo",
    secao: "landing",
    secaoLabel: "Página inicial",
    label: "Título da chamada final",
    padrao: "Pronto para registrar sua primeira imagem?",
    tipo: "texto",
  },
  {
    chave: "landing.cta.subtitulo",
    secao: "landing",
    secaoLabel: "Página inicial",
    label: "Texto da chamada final",
    padrao: "Leva menos de dois minutos, e o primeiro certificado é por nossa conta.",
    tipo: "texto",
  },

  // Preços
  {
    chave: "precos.header.titulo",
    secao: "precos",
    secaoLabel: "Preços",
    label: "Título do topo",
    padrao: "Um plano para provar e acompanhar.",
    tipo: "texto",
  },
  {
    chave: "precos.header.subtitulo",
    secao: "precos",
    secaoLabel: "Preços",
    label: "Subtítulo do topo",
    padrao:
      "Cada plano inclui registros de imagem e acompanhamento de processos do INPI por mês. Escolha o ciclo de cobrança que fizer mais sentido pra você.",
    tipo: "textarea",
  },
  {
    chave: "precos.recarga.titulo",
    secao: "precos",
    secaoLabel: "Preços",
    label: "Título da seção de recarga avulsa",
    padrao: "Recarga de créditos avulsa",
    tipo: "texto",
  },
  {
    chave: "precos.recarga.subtitulo",
    secao: "precos",
    secaoLabel: "Preços",
    label: "Texto da seção de recarga avulsa",
    padrao:
      "Precisou de mais registros do que o incluso no plano deste mês? Compre créditos avulsos a qualquer momento, sem esperar o próximo ciclo — eles não expiram.",
    tipo: "textarea",
  },
  ...[0, 1, 2, 3, 4].flatMap((i) => {
    const padroes = [
      {
        pergunta: "O que é um crédito?",
        resposta:
          "Cada crédito registra uma imagem: gera o hash SHA-256, o carimbo de tempo e o certificado correspondente. Créditos não expiram.",
      },
      {
        pergunta: "O certificado tem validade jurídica de registro de direitos autorais?",
        resposta:
          "Não. O certificado é uma prova de anterioridade baseada em carimbo de tempo — útil como evidência complementar, mas não substitui o registro oficial junto a órgãos como a Biblioteca Nacional.",
      },
      {
        pergunta: "Posso registrar a mesma imagem mais de uma vez?",
        resposta: "Sim, mas cada registro consome um crédito e gera um novo certificado com nova data.",
      },
      {
        pergunta: "Existe plano de assinatura?",
        resposta:
          "Sim — os planos Essencial, Estúdio e Portfólio incluem uma cota de registros de imagem e de processos do INPI acompanhados por mês, em ciclos mensal, semestral ou anual. A assinatura ainda está sendo habilitada; por enquanto o checkout funciona pelos pacotes avulsos abaixo.",
      },
      {
        pergunta: "O que acontece se eu usar todos os créditos do mês na assinatura?",
        resposta:
          "Dá pra comprar recarga avulsa de créditos a qualquer momento, sem esperar o próximo ciclo — são os mesmos pacotes vendidos hoje, listados abaixo dos planos.",
      },
    ];
    const item = padroes[i];
    return [
      {
        chave: `precos.faq.${i}.pergunta`,
        secao: "precos",
        secaoLabel: "Preços",
        label: `FAQ ${i + 1} — pergunta`,
        padrao: item.pergunta,
        tipo: "texto" as const,
      },
      {
        chave: `precos.faq.${i}.resposta`,
        secao: "precos",
        secaoLabel: "Preços",
        label: `FAQ ${i + 1} — resposta`,
        padrao: item.resposta,
        tipo: "textarea" as const,
      },
    ];
  }),

  // Rodapé
  {
    chave: "footer.descricao",
    secao: "footer",
    secaoLabel: "Rodapé",
    label: "Descrição abaixo do logo",
    padrao: "Carimbo de tempo e certificado de anterioridade para fotógrafos, ilustradores e designers.",
    tipo: "textarea",
  },
  {
    chave: "footer.disclaimer",
    secao: "footer",
    secaoLabel: "Rodapé",
    label: "Aviso legal",
    padrao:
      "Este produto não substitui registro oficial de direitos autorais junto a órgãos competentes e não constitui aconselhamento jurídico. O certificado emitido é uma prova de anterioridade baseada em carimbo de tempo, útil como evidência complementar em eventuais disputas.",
    tipo: "textarea",
  },
  {
    chave: "footer.copyright",
    secao: "footer",
    secaoLabel: "Rodapé",
    label: "Linha de copyright",
    padrao: "© 2026 Revollution Lastro. Todos os direitos reservados.",
    tipo: "texto",
  },

  // Painel (logado)
  {
    chave: "dashboard.home.titulo",
    secao: "dashboard",
    secaoLabel: "Painel (logado)",
    label: "Título do painel principal",
    padrao: "Seus registros",
    tipo: "texto",
  },
  {
    chave: "dashboard.instalarApp.titulo",
    secao: "dashboard",
    secaoLabel: "Painel (logado)",
    label: "Card \"instalar app\" — título",
    padrao: "Tenha o Revollution Lastro sempre à mão",
    tipo: "texto",
  },
  {
    chave: "dashboard.instalarApp.descricao",
    secao: "dashboard",
    secaoLabel: "Painel (logado)",
    label: "Card \"instalar app\" — texto",
    padrao:
      "Instale o app no seu celular para acessar seus registros, alertas e processos do INPI direto da tela inicial, sem precisar abrir o navegador.",
    tipo: "textarea",
  },
  {
    chave: "dashboard.boasVindas.titulo",
    secao: "dashboard",
    secaoLabel: "Painel (logado)",
    label: "Modal de boas-vindas — título",
    padrao: "Leve o Revollution Lastro com você",
    tipo: "texto",
  },
  {
    chave: "dashboard.boasVindas.descricao",
    secao: "dashboard",
    secaoLabel: "Painel (logado)",
    label: "Modal de boas-vindas — texto",
    padrao:
      "Instale o app no seu celular para acessar seus certificados, alertas e processos do INPI rapidinho, direto da tela inicial.",
    tipo: "textarea",
  },

  // Planos de assinatura (nome + benefícios — preço fica de fora de
  // propósito, ver nota em app/(admin)/admin/conteudo/[secao]/page.tsx)
  ...(
    [
      { id: "essencial", nome: "Essencial", beneficios: [
        "8 registros de imagem por mês",
        "Acompanhamento de até 2 processos do INPI",
        "Certificado em PDF por registro",
        "Alertas de uso indevido e de atualização do INPI por e-mail",
      ] },
      { id: "estudio", nome: "Estúdio", beneficios: [
        "20 registros de imagem por mês",
        "Acompanhamento de até 5 processos do INPI",
        "Certificado em PDF por registro",
        "Alertas de uso indevido e de atualização do INPI por e-mail",
        "Suporte prioritário por e-mail",
      ] },
      { id: "portfolio", nome: "Portfólio", beneficios: [
        "50 registros de imagem por mês",
        "Acompanhamento de até 15 processos do INPI",
        "Certificado em PDF por registro",
        "Alertas de uso indevido e de atualização do INPI por e-mail",
        "Suporte prioritário por e-mail",
      ] },
    ] satisfies { id: string; nome: string; beneficios: string[] }[]
  ).flatMap((plano): CampoConteudo[] => [
    {
      chave: `planos.${plano.id}.nome`,
      secao: "planos",
      secaoLabel: "Planos de assinatura",
      label: `Plano ${plano.nome} — nome`,
      padrao: plano.nome,
      tipo: "texto",
    },
    ...plano.beneficios.map(
      (beneficio, i): CampoConteudo => ({
        chave: `planos.${plano.id}.beneficio.${i}`,
        secao: "planos",
        secaoLabel: "Planos de assinatura",
        label: `Plano ${plano.nome} — benefício ${i + 1}`,
        padrao: beneficio,
        tipo: "texto",
      })
    ),
  ]),

  // Pacotes de créditos avulsos (nome, preço, créditos e benefícios — o
  // preço aqui É a fonte de verdade da cobrança real, ver
  // lib/pacotes.ts#resolverPacotes)
  ...(
    [
      {
        id: "avulso",
        nome: "Avulso",
        creditos: 5,
        precoReais: "39",
        porImagem: "R$ 7,80 por imagem",
        beneficios: [
          "5 registros de imagem",
          "Certificado em PDF por registro",
          "QR code de verificação pública",
          "Créditos sem prazo de validade",
        ],
      },
      {
        id: "estudio",
        nome: "Estúdio",
        creditos: 20,
        precoReais: "129",
        porImagem: "R$ 6,45 por imagem",
        beneficios: [
          "20 registros de imagem",
          "Certificado em PDF por registro",
          "QR code de verificação pública",
          "Créditos sem prazo de validade",
          "Suporte prioritário por e-mail",
        ],
      },
      {
        id: "portfolio",
        nome: "Portfólio",
        creditos: 50,
        precoReais: "279",
        porImagem: "R$ 5,58 por imagem",
        beneficios: [
          "50 registros de imagem",
          "Certificado em PDF por registro",
          "QR code de verificação pública",
          "Créditos sem prazo de validade",
          "Suporte prioritário por e-mail",
        ],
      },
    ] satisfies { id: string; nome: string; creditos: number; precoReais: string; porImagem: string; beneficios: string[] }[]
  ).flatMap((pacote): CampoConteudo[] => [
    {
      chave: `pacotes.${pacote.id}.nome`,
      secao: "pacotes",
      secaoLabel: "Pacotes de créditos",
      label: `Pacote ${pacote.nome} — nome`,
      padrao: pacote.nome,
      tipo: "texto",
    },
    {
      chave: `pacotes.${pacote.id}.creditos`,
      secao: "pacotes",
      secaoLabel: "Pacotes de créditos",
      label: `Pacote ${pacote.nome} — quantidade de créditos`,
      padrao: String(pacote.creditos),
      tipo: "texto",
    },
    {
      chave: `pacotes.${pacote.id}.precoReais`,
      secao: "pacotes",
      secaoLabel: "Pacotes de créditos",
      label: `Pacote ${pacote.nome} — preço em R$ (ex.: 39 ou 39,90)`,
      padrao: pacote.precoReais,
      tipo: "texto",
    },
    {
      chave: `pacotes.${pacote.id}.porImagem`,
      secao: "pacotes",
      secaoLabel: "Pacotes de créditos",
      label: `Pacote ${pacote.nome} — preço por imagem (texto)`,
      padrao: pacote.porImagem,
      tipo: "texto",
    },
    ...pacote.beneficios.map(
      (beneficio, i): CampoConteudo => ({
        chave: `pacotes.${pacote.id}.beneficio.${i}`,
        secao: "pacotes",
        secaoLabel: "Pacotes de créditos",
        label: `Pacote ${pacote.nome} — benefício ${i + 1}`,
        padrao: beneficio,
        tipo: "texto",
      })
    ),
  ]),
];

/** Busca todas as sobrescritas salvas pelo admin. Chave sem linha aqui = usa o padrão do registro acima. */
export async function buscarConteudo(): Promise<Record<string, string>> {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.from("conteudos_site").select("chave, valor");

  const mapa: Record<string, string> = {};
  for (const linha of (data ?? []) as { chave: string; valor: string }[]) {
    mapa[linha.chave] = linha.valor;
  }
  return mapa;
}

export function valorConteudo(mapa: Record<string, string>, chave: string): string {
  const valor = mapa[chave];
  if (valor && valor.trim() !== "") return valor;
  return CAMPOS_CONTEUDO.find((c) => c.chave === chave)?.padrao ?? "";
}
