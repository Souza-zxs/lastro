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
