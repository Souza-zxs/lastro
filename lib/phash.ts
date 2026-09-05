/**
 * Hash perceptual (dHash — difference hash) calculado no navegador, do
 * mesmo jeito que o SHA-256 em lib/hash.ts — calculado localmente antes
 * do upload, sem depender de round-trip com o servidor.
 *
 * Diferente do SHA-256 (muda completamente se um único byte mudar), o
 * dHash é estável a recompressão/redimensionamento/pequenos recortes —
 * é o que permite achar cópias da imagem depois de ela ter passado por
 * upload em outro site. Reduz a imagem para 9×8 em tons de cinza e
 * compara cada pixel com o vizinho à direita: 64 bits, 16 caracteres hex.
 */
export async function computePerceptualHashHex(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);

  const canvas = document.createElement("canvas");
  canvas.width = 9;
  canvas.height = 8;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Não foi possível calcular o hash perceptual da imagem");

  ctx.drawImage(bitmap, 0, 0, 9, 8);
  bitmap.close();

  const { data } = ctx.getImageData(0, 0, 9, 8);
  const cinza: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    cinza.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }

  let bits = "";
  for (let linha = 0; linha < 8; linha++) {
    for (let coluna = 0; coluna < 8; coluna++) {
      const esquerda = cinza[linha * 9 + coluna];
      const direita = cinza[linha * 9 + coluna + 1];
      bits += esquerda > direita ? "1" : "0";
    }
  }

  let hex = "";
  for (let i = 0; i < 64; i += 4) {
    hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  }
  return hex;
}

/** Distância de Hamming entre dois dHash em hex — 0 = idênticas, 64 = opostas. */
export function distanciaHamming(hashA: string, hashB: string): number {
  if (hashA.length !== hashB.length) return 64;
  let distancia = 0;
  for (let i = 0; i < hashA.length; i++) {
    const diff = parseInt(hashA[i], 16) ^ parseInt(hashB[i], 16);
    distancia += diff.toString(2).split("1").length - 1;
  }
  return distancia;
}
