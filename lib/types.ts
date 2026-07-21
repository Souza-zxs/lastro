export type StatusRegistro = "confirmado" | "processando";

export interface Registro {
  id: string;
  codigo_verificacao: string;
  titulo: string;
  categoria: string;
  autor: string;
  email_autor: string;
  data_registro: string;
  hash_sha256: string;
  hash_perceptual: string | null;
  imagem_thumb: string;
  formato: string;
  dimensoes: string;
  tamanho_bytes: number;
  status: StatusRegistro;
  ultimo_scan_em: string | null;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  documento: string;
  plano: string;
  creditos_disponiveis: number;
  membro_desde: string;
  monitoramento_ativo: boolean;
}

export type StatusAlerta = "novo" | "revisado" | "ignorado" | "em_disputa" | "resolvido";

export interface AlertaUsoIndevido {
  id: string;
  registro_id: string;
  user_id: string;
  url_encontrada: string;
  dominio: string;
  similaridade: number;
  metodo: string;
  status: StatusAlerta;
  encontrado_em: string;
  created_at: string;
}
