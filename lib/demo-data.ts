import type { Registro } from "@/lib/types";

// Registro de exemplo fixo, usado apenas nas páginas de marketing (hero da
// landing e link de "testar um exemplo" em /verificar). É conteúdo
// presentational — não precisa vir do banco.
export const registroDemo: Registro = {
  id: "reg_001",
  codigo_verificacao: "9F3A-7C1D-2B84",
  titulo: "Retrato Urbano — Série SP",
  categoria: "Fotografia",
  autor: "Camila Rocha",
  email_autor: "camila.rocha@example.com",
  autor_documento: "123.456.789-00",
  autor_endereco: "Rua Augusta, 1200 — São Paulo, SP",
  data_registro: "2026-06-15T14:32:00Z",
  hash_sha256: "f3a1c9d84b2e7a05c6f19d3e88a2b4c7091fd5e3a6b8c0d2e4f61a7395c8b0d1",
  hash_perceptual: null,
  imagem_thumb: "/mock/imagem1-thumb.svg",
  formato: "JPEG",
  dimensoes: "4000 × 6000 px",
  tamanho_bytes: 8912340,
  status: "confirmado",
  ultimo_scan_em: null,
  declaracao_autoria: true,
  arquivo_original_path: null,
};
