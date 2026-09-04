export type CicloCobranca = "mensal" | "semestral" | "anual";

export interface PrecoPorCiclo {
  total: string;
  totalCentavos: number;
  porMes: string;
  /** Link de checkout hospedado na Greenn (payfast.greenn.com.br) para este plano+ciclo. */
  checkoutUrl: string;
}

export interface Plano {
  id: string;
  nome: string;
  creditosPorMes: number;
  processosInpiInclusos: number;
  destaque: boolean;
  beneficios: string[];
  precoPorCiclo: Record<CicloCobranca, PrecoPorCiclo>;
}

export const CICLOS: { id: CicloCobranca; label: string; cobranca: string }[] = [
  { id: "mensal", label: "Mensal", cobranca: "cobrado todo mês" },
  { id: "semestral", label: "Semestral", cobranca: "cobrado a cada 6 meses" },
  { id: "anual", label: "Anual", cobranca: "cobrado 1x por ano" },
];

// Preços em fase de definição — os produtos correspondentes ainda estão
// sendo cadastrados no gateway de pagamento (ver checkout em
// lib/asaas.ts, que deve ser substituído). Créditos são por mês (não
// acumulam de um ciclo pro outro); quem precisar de mais além do incluso
// no plano compra recarga avulsa (ver lib/pacotes.ts).
export const PLANOS: Plano[] = [
  {
    id: "essencial",
    nome: "Essencial",
    creditosPorMes: 8,
    processosInpiInclusos: 2,
    destaque: false,
    beneficios: [
      "8 registros de imagem por mês",
      "Acompanhamento de até 2 processos do INPI",
      "Certificado em PDF por registro",
      "Alertas de uso indevido e de atualização do INPI por e-mail",
    ],
    precoPorCiclo: {
      mensal: {
        total: "R$ 49",
        totalCentavos: 4900,
        porMes: "R$ 49/mês",
        checkoutUrl: "https://payfast.greenn.com.br/d86rm5y",
      },
      semestral: {
        total: "R$ 264",
        totalCentavos: 26400,
        porMes: "R$ 44/mês",
        checkoutUrl: "https://payfast.greenn.com.br/wbjvb65",
      },
      anual: {
        total: "R$ 470",
        totalCentavos: 47000,
        porMes: "R$ 39/mês",
        checkoutUrl: "https://payfast.greenn.com.br/hg9h3th",
      },
    },
  },
  {
    id: "estudio",
    nome: "Estúdio",
    creditosPorMes: 20,
    processosInpiInclusos: 5,
    destaque: true,
    beneficios: [
      "20 registros de imagem por mês",
      "Acompanhamento de até 5 processos do INPI",
      "Certificado em PDF por registro",
      "Alertas de uso indevido e de atualização do INPI por e-mail",
      "Suporte prioritário por e-mail",
    ],
    precoPorCiclo: {
      mensal: {
        total: "R$ 99",
        totalCentavos: 9900,
        porMes: "R$ 99/mês",
        checkoutUrl: "https://payfast.greenn.com.br/wn2fyu2",
      },
      semestral: {
        total: "R$ 535",
        totalCentavos: 53500,
        porMes: "R$ 89/mês",
        checkoutUrl: "https://payfast.greenn.com.br/wax4ung",
      },
      anual: {
        total: "R$ 950",
        totalCentavos: 95000,
        porMes: "R$ 79/mês",
        checkoutUrl: "https://payfast.greenn.com.br/k39qs4p",
      },
    },
  },
  {
    id: "portfolio",
    nome: "Portfólio",
    creditosPorMes: 50,
    processosInpiInclusos: 15,
    destaque: false,
    beneficios: [
      "50 registros de imagem por mês",
      "Acompanhamento de até 15 processos do INPI",
      "Certificado em PDF por registro",
      "Alertas de uso indevido e de atualização do INPI por e-mail",
      "Suporte prioritário por e-mail",
    ],
    precoPorCiclo: {
      mensal: {
        total: "R$ 199",
        totalCentavos: 19900,
        porMes: "R$ 199/mês",
        checkoutUrl: "https://payfast.greenn.com.br/fpu4dmh",
      },
      semestral: {
        total: "R$ 1.075",
        totalCentavos: 107500,
        porMes: "R$ 179/mês",
        checkoutUrl: "https://payfast.greenn.com.br/sjm623g",
      },
      anual: {
        total: "R$ 1.910",
        totalCentavos: 191000,
        porMes: "R$ 159/mês",
        checkoutUrl: "https://payfast.greenn.com.br/tuzxspt",
      },
    },
  },
];

export function getPlano(id: string) {
  return PLANOS.find((plano) => plano.id === id);
}
