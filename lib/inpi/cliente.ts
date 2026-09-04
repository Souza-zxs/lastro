import * as cheerio from "cheerio";
import type { TipoProcessoInpi } from "@/lib/types";

/**
 * Cliente do portal público de busca do INPI (pePI, busca.inpi.gov.br).
 * Não existe API oficial — este cliente reproduz o fluxo de consulta
 * anônima do próprio site: abrir uma sessão sem login, depois consultar
 * por número de processo reaproveitando o cookie de sessão. Só existe uma
 * fonte de dados aqui, então isso não é uma abstração de "provedor
 * escolhível" como lib/monitoramento/provedor.ts — é o cliente da única
 * fonte que existe.
 */

const BASE = "https://busca.inpi.gov.br/pePI";
const TIMEOUT_MS = 45_000;
const USER_AGENT = "Mozilla/5.0 (compatible; LastroBot/1.0; +https://lastro.app)";

const JSP_POR_TIPO: Record<TipoProcessoInpi, string> = {
  marca: `${BASE}/jsp/marcas/Pesquisa_num_processo.jsp`,
  patente: `${BASE}/jsp/patentes/PatenteSearchBasico.jsp`,
  desenho_industrial: `${BASE}/jsp/desenhos/DesenhoSearchBasico.jsp`,
};

const SERVLET_POR_TIPO: Record<TipoProcessoInpi, string> = {
  marca: `${BASE}/servlet/MarcasServletController`,
  patente: `${BASE}/servlet/PatenteServletController`,
  desenho_industrial: `${BASE}/servlet/DesenhoServletController`,
};

export type ResultadoConsultaInpi =
  | { tipo: "nao_encontrado" }
  | {
      tipo: "encontrado";
      situacao: string | null;
      despachoCodigo: string | null;
      despachoDescricao: string | null;
      despachoData: string | null;
      numeroRpi: string | null;
      dadosAtualizadosAte: string | null;
    }
  // A página não bateu com nenhum padrão conhecido (marcação do INPI
  // mudou, ou o caso "encontrado" de patente/desenho ainda não foi
  // validado contra uma resposta real — ver plano de implementação). O
  // job trata isso como falha e não mexe no snapshot salvo, em vez de
  // arriscar gravar um "não encontrado" ou "sem mudança" errado.
  | { tipo: "nao_reconhecido" };

async function fetchComTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function setCookiesDaResposta(resposta: Response): string[] {
  const headers = resposta.headers as Headers & { getSetCookie?: () => string[] };
  if (typeof headers.getSetCookie === "function") return headers.getSetCookie();
  const unico = resposta.headers.get("set-cookie");
  return unico ? [unico] : [];
}

/** Combina um cookie header existente com novos Set-Cookie, sobrescrevendo por nome. */
function mesclarCookies(atual: string, novosSetCookie: string[]): string {
  const mapa = new Map<string, string>();
  for (const par of atual.split(";").map((s) => s.trim()).filter(Boolean)) {
    const [nome, valor] = par.split("=");
    if (nome) mapa.set(nome, valor ?? "");
  }
  for (const setCookie of novosSetCookie) {
    const par = setCookie.split(";")[0]?.trim();
    if (!par) continue;
    const [nome, valor] = par.split("=");
    if (nome) mapa.set(nome, valor ?? "");
  }
  return Array.from(mapa, ([nome, valor]) => `${nome}=${valor}`).join("; ");
}

/**
 * Abre uma sessão anônima de pesquisa no pePI: GET no jsp do tipo (define
 * JSESSIONID), depois GET em LoginController?action=login — é o mesmo
 * link "Para realizar a Pesquisa anonimamente aperte apenas o botão
 * Continuar...." da tela de login do site, sem precisar de usuário/senha.
 * O cookie devolvido pode ser reaproveitado em várias chamadas de
 * consultarProcesso (mesmo tipo ou tipos diferentes) dentro do mesmo run
 * do job, evitando repetir esse handshake por processo.
 */
export async function abrirSessaoInpi(tipo: TipoProcessoInpi = "marca"): Promise<string> {
  const respostaJsp = await fetchComTimeout(JSP_POR_TIPO[tipo], {
    headers: { "User-Agent": USER_AGENT },
  });
  const cookieInicial = mesclarCookies("", setCookiesDaResposta(respostaJsp));

  const respostaLogin = await fetchComTimeout(`${BASE}/servlet/LoginController?action=login`, {
    headers: { "User-Agent": USER_AGENT, Cookie: cookieInicial },
  });

  return mesclarCookies(cookieInicial, setCookiesDaResposta(respostaLogin));
}

function corpoDaConsulta(tipo: TipoProcessoInpi, numeroProcesso: string): string {
  const body = new URLSearchParams();
  body.set("NumPedido", numeroProcesso);
  body.set("botao", " pesquisar ");
  if (tipo === "marca") {
    body.set("Action", "searchMarca");
    body.set("tipoPesquisa", "BY_NUM_PROC");
  } else {
    body.set("Action", "SearchBasico");
  }
  return body.toString();
}

/**
 * Extrai pares rótulo/valor do formato usado nas páginas de resultado do
 * pePI: `<B>Nº do Processo: </B>&nbsp; 823767730 <BR>` — um <b> com o
 * rótulo, seguido de um nó de texto com o valor. Validado contra o HTML
 * real do caso "não encontrado" de marca; o caso "encontrado" (e as
 * páginas de patente/desenho) ainda precisam ser conferidos contra uma
 * consulta real para confirmar que usam o mesmo padrão.
 */
function extrairCamposRotulados($: cheerio.CheerioAPI): Map<string, string> {
  const campos = new Map<string, string>();
  $("b, B").each((_, elemento) => {
    const rotulo = $(elemento).text().replace(/[:\s]+$/, "").trim();
    if (!rotulo) return;
    const proximo = elemento.nextSibling;
    const bruto = proximo && proximo.type === "text" ? (proximo.data ?? "") : "";
    const valor = bruto.replace(/ /g, " ").trim();
    if (valor) campos.set(rotulo, valor);
  });
  return campos;
}

const PADRAO_NAO_ENCONTRADO = /nenhum resultado foi encontrado/i;

/** Converte "dd/mm/aaaa" (formato usado pelo INPI) pra "aaaa-mm-dd" (ISO). */
function paraDataIso(valor: string | undefined): string | null {
  const match = valor?.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : null;
}

/**
 * Estratégia principal, validada contra uma consulta real de marca por
 * número de processo: o resultado vem como uma TABELA (mesmo formato de
 * uma busca por nome/titular), não como uma página de detalhe com
 * rótulo/valor — mesmo pra um único processo encontrado. Acha a linha de
 * cabeçalho (a que contém a célula "Situação") e lê a linha de dados
 * logo abaixo dela, pareando por posição de coluna — isso é resiliente a
 * colunas sem rótulo (ex.: células só com ícone).
 */
function extrairLinhaResultado($: cheerio.CheerioAPI): Map<string, string> | null {
  const textosPorLinha = $("tr")
    .toArray()
    .map((tr) => $(tr).find("td").toArray().map((td) => $(td).text().replace(/\s+/g, " ").trim()));

  const indiceCabecalho = textosPorLinha.findIndex(
    (textos) => textos.includes("Situação") || textos.includes("Situacao")
  );
  const cabecalho = indiceCabecalho >= 0 ? textosPorLinha[indiceCabecalho] : undefined;
  const valores = indiceCabecalho >= 0 ? textosPorLinha[indiceCabecalho + 1] : undefined;
  if (!cabecalho || !valores) return null;

  const mapa = new Map<string, string>();
  cabecalho.forEach((rotulo, i) => {
    if (rotulo) mapa.set(rotulo, valores[i] ?? "");
  });
  return mapa;
}

function parseResultado(html: string): ResultadoConsultaInpi {
  if (PADRAO_NAO_ENCONTRADO.test(html)) {
    return { tipo: "nao_encontrado" };
  }

  const $ = cheerio.load(html);
  const textoCompleto = $("body").text();

  const revistaMatch = textoCompleto.match(/N[ºo°]\s*da Revista:\s*(\S+)/i);
  const atualizadoMatch = textoCompleto.match(/Dados atualizados\s+at[ée]\s*(\d{2}\/\d{2}\/\d{4})/i);
  const numeroRpi = revistaMatch?.[1]?.trim() || null;
  const dadosAtualizadosAte = paraDataIso(atualizadoMatch?.[1]);

  const linha = extrairLinhaResultado($);
  if (linha) {
    const situacao = linha.get("Situação") || linha.get("Situacao") || null;
    return {
      tipo: "encontrado",
      situacao,
      // A tabela de resultado não mostra código/data de despacho
      // individual (só a situação atual e a data de prioridade/depósito,
      // que não é despacho) — pra isso seria preciso abrir a página de
      // detalhe do processo (link "Action=detail&CodPedido=..." na
      // própria linha), não implementado ainda.
      despachoCodigo: null,
      despachoDescricao: situacao,
      despachoData: null,
      numeroRpi,
      dadosAtualizadosAte,
    };
  }

  // Fallback pro formato "rótulo em <b> seguido do valor como texto" —
  // não confirmado contra nenhuma resposta real até agora (toda consulta
  // testada devolveu tabela), mantido por segurança caso patente/desenho
  // usem um formato diferente de marca.
  const campos = extrairCamposRotulados($);
  const situacao = campos.get("Situação") ?? campos.get("Situacao") ?? null;
  const despachoDescricao = campos.get("Despacho") ?? campos.get("Último Despacho") ?? null;
  const despachoCodigo = campos.get("Código do Despacho") ?? campos.get("Cod. Despacho") ?? null;
  const despachoData = paraDataIso(campos.get("Data do Despacho") ?? campos.get("Data"));

  if (!situacao && !despachoDescricao) {
    return { tipo: "nao_reconhecido" };
  }

  return {
    tipo: "encontrado",
    situacao,
    despachoCodigo,
    despachoDescricao,
    despachoData,
    numeroRpi,
    dadosAtualizadosAte,
  };
}

export async function consultarProcesso({
  cookie,
  numeroProcesso,
  tipo,
}: {
  cookie: string;
  numeroProcesso: string;
  tipo: TipoProcessoInpi;
}): Promise<ResultadoConsultaInpi> {
  const resposta = await fetchComTimeout(SERVLET_POR_TIPO[tipo], {
    method: "POST",
    headers: {
      "User-Agent": USER_AGENT,
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookie,
    },
    body: corpoDaConsulta(tipo, numeroProcesso),
  });

  // O site responde em ISO-8859-1 — resposta.text() assumiria UTF-8 e
  // estragaria acentuação, o que quebraria os regexes de rótulo acima.
  const buffer = await resposta.arrayBuffer();
  const html = new TextDecoder("iso-8859-1").decode(buffer);

  return parseResultado(html);
}
