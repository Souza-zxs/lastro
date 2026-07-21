import { distanciaHamming } from "@/lib/phash";

// De 64 bits — bem tolerante a recompressão, mas ainda exige que seja
// essencialmente a mesma imagem (não só "parecida no estilo").
const DISTANCIA_MAXIMA = 4;

export interface CandidatoDedup {
  id: string;
  hash_perceptual: string | null;
}

/**
 * Entre os registros já escaneados do mesmo usuário, acha o mais próximo
 * (por hash perceptual) do registro que está prestes a ser escaneado. Se
 * achar, o job reaproveita os alertas já existentes daquele registro em vez
 * de pagar por uma nova chamada ao provedor de busca reversa pra,
 * efetivamente, a mesma imagem.
 */
export function encontrarRegistroSemelhante(
  hashAlvo: string,
  candidatos: CandidatoDedup[]
): { id: string; distancia: number } | null {
  let melhor: { id: string; distancia: number } | null = null;

  for (const candidato of candidatos) {
    if (!candidato.hash_perceptual) continue;
    const distancia = distanciaHamming(hashAlvo, candidato.hash_perceptual);
    if (distancia <= DISTANCIA_MAXIMA && (!melhor || distancia < melhor.distancia)) {
      melhor = { id: candidato.id, distancia };
    }
  }

  return melhor;
}
