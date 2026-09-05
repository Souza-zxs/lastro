import "server-only";
import { buscarConteudo, valorConteudo } from "@/lib/conteudo";
import { formatCentavos } from "@/lib/format";

export interface Pacote {
  id: string;
  nome: string;
  creditos: number;
  preco: string;
  precoCentavos: number;
  porImagem: string;
  destaque: boolean;
  beneficios: string[];
}

export const PACOTES: Pacote[] = [
  {
    id: "avulso",
    nome: "Avulso",
    creditos: 5,
    preco: "R$ 39",
    precoCentavos: 3900,
    porImagem: "R$ 7,80 por imagem",
    destaque: false,
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
    preco: "R$ 129",
    precoCentavos: 12900,
    porImagem: "R$ 6,45 por imagem",
    destaque: true,
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
    preco: "R$ 279",
    precoCentavos: 27900,
    porImagem: "R$ 5,58 por imagem",
    destaque: false,
    beneficios: [
      "50 registros de imagem",
      "Certificado em PDF por registro",
      "QR code de verificação pública",
      "Créditos sem prazo de validade",
      "Suporte prioritário por e-mail",
    ],
  },
];

export function getPacote(id: string) {
  return PACOTES.find((pacote) => pacote.id === id);
}

/**
 * Mescla os pacotes padrão com o que o admin sobrescreveu em
 * /admin/conteudo/pacotes. Diferente dos outros textos do site, o preço
 * aqui é a fonte de verdade real: /api/checkout usa exatamente este valor
 * pra cobrar no Asaas — editar aqui muda o que o cliente paga de verdade
 * (ao contrário dos planos de assinatura, cujo checkout é um link externo
 * fixo da Greenn e por isso não tem preço editável).
 */
export async function resolverPacotes(): Promise<Pacote[]> {
  const mapa = await buscarConteudo();
  return PACOTES.map((pacote) => resolverPacoteComMapa(pacote, mapa));
}

export async function resolverPacote(id: string): Promise<Pacote | undefined> {
  const pacote = getPacote(id);
  if (!pacote) return undefined;
  const mapa = await buscarConteudo();
  return resolverPacoteComMapa(pacote, mapa);
}

function resolverPacoteComMapa(pacote: Pacote, mapa: Record<string, string>): Pacote {
  const prefixo = `pacotes.${pacote.id}`;

  const creditosTexto = valorConteudo(mapa, `${prefixo}.creditos`);
  const creditos = Math.trunc(Number(creditosTexto));

  const precoReaisTexto = valorConteudo(mapa, `${prefixo}.precoReais`).replace(",", ".");
  const precoReais = parseFloat(precoReaisTexto);
  const precoCentavos = Number.isFinite(precoReais) ? Math.round(precoReais * 100) : pacote.precoCentavos;

  return {
    ...pacote,
    nome: valorConteudo(mapa, `${prefixo}.nome`),
    creditos: Number.isFinite(creditos) && creditos > 0 ? creditos : pacote.creditos,
    precoCentavos,
    preco: formatCentavos(precoCentavos),
    porImagem: valorConteudo(mapa, `${prefixo}.porImagem`),
    beneficios: pacote.beneficios.map((_, i) => valorConteudo(mapa, `${prefixo}.beneficio.${i}`)),
  };
}
