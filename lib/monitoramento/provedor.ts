export interface ResultadoBusca {
  url: string;
  similaridade: number; // 0-100
}

export interface ProvedorBuscaReversa {
  nome: string;
  buscar(params: { imagemUrl: string; hashPerceptual: string | null }): Promise<ResultadoBusca[]>;
}

/** Nunca encontra nada — mantido só como referência/para uso em testes. */
export const provedorStub: ProvedorBuscaReversa = {
  nome: "stub",
  async buscar() {
    return [];
  },
};

const GOOGLE_VISION_ENDPOINT = "https://vision.googleapis.com/v1/images:annotate";
const TIMEOUT_MS = 15_000;

// A miniatura já é pública (bucket `thumbnails`), então dá pra mandar a URL
// direto pro Vision analisar (`image.source.imageUri`) em vez de baixar o
// arquivo aqui e mandar os bytes em base64.
const SIMILARIDADE_MATCH_TOTAL = 100;
const SIMILARIDADE_MATCH_PARCIAL = 70;

interface GoogleVisionImagemEncontrada {
  url: string;
}

interface GoogleVisionPaginaEncontrada {
  url: string;
  fullMatchingImages?: GoogleVisionImagemEncontrada[];
  partialMatchingImages?: GoogleVisionImagemEncontrada[];
}

interface GoogleVisionResposta {
  webDetection?: {
    fullMatchingImages?: GoogleVisionImagemEncontrada[];
    pagesWithMatchingImages?: GoogleVisionPaginaEncontrada[];
    // `visuallySimilarImages` existe na API mas é ignorado de propósito: é
    // "parecido no estilo", não "é a mesma foto" — incluiria bastante
    // ruído/falso positivo pro caso de uso de detectar uso indevido.
  };
  error?: { message: string };
}

/**
 * Google Cloud Vision — Web Detection. Self-service via GCP (só precisa de
 * uma API key, sem contato comercial), cobra por imagem processada, e usa
 * o próprio índice de busca do Google — a maior cobertura de web entre as
 * opções consideradas. Ver GOOGLE_VISION_API_KEY em .env.example.
 */
export const provedorGoogleVision: ProvedorBuscaReversa = {
  nome: "google-vision-web-detection",
  async buscar({ imagemUrl }) {
    const apiKey = process.env.GOOGLE_VISION_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_VISION_API_KEY não configurada.");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let resposta: Response;
    try {
      resposta = await fetch(`${GOOGLE_VISION_ENDPOINT}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { source: { imageUri: imagemUrl } },
              features: [{ type: "WEB_DETECTION", maxResults: 20 }],
            },
          ],
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!resposta.ok) {
      throw new Error(`Google Vision respondeu ${resposta.status}: ${await resposta.text()}`);
    }

    const corpo = (await resposta.json()) as { responses?: GoogleVisionResposta[] };
    const deteccao = corpo.responses?.[0];

    if (deteccao?.error) {
      throw new Error(`Google Vision: ${deteccao.error.message}`);
    }

    const web = deteccao?.webDetection;
    if (!web) return [];

    // url -> maior similaridade encontrada pra essa url (dedup entre as
    // diferentes listas que a API devolve).
    const achados = new Map<string, number>();

    for (const pagina of web.pagesWithMatchingImages ?? []) {
      const similaridade =
        (pagina.fullMatchingImages?.length ?? 0) > 0 ? SIMILARIDADE_MATCH_TOTAL : SIMILARIDADE_MATCH_PARCIAL;
      achados.set(pagina.url, Math.max(achados.get(pagina.url) ?? 0, similaridade));
    }

    // Imagem idêntica encontrada sem uma página associada (ex.: hotlink direto).
    for (const imagem of web.fullMatchingImages ?? []) {
      achados.set(imagem.url, Math.max(achados.get(imagem.url) ?? 0, SIMILARIDADE_MATCH_TOTAL));
    }

    return Array.from(achados, ([url, similaridade]) => ({ url, similaridade }));
  },
};

export const provedorAtivo: ProvedorBuscaReversa = provedorGoogleVision;
