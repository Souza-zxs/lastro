import { headers } from "next/headers";

/**
 * Origem pública (protocolo + host) da requisição atual, lida direto dos
 * headers — não depende de `NEXT_PUBLIC_SITE_URL` estar configurada
 * corretamente em produção (se essa env var ficar desatualizada ou for
 * esquecida no build, links gerados no servidor apontariam pro valor
 * errado). Só funciona em Server Components/Route Handlers.
 */
export async function origemAtual(): Promise<string | undefined> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return undefined;
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}
