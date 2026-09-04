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
  plano_id: string | null;
  plano_ciclo: string | null;
  plano_processos_bonus: number;
  plano_ativado_em: string | null;
  is_admin: boolean;
}

export type StatusPedido = "pendente" | "pago" | "cancelado";

export interface Pedido {
  id: string;
  user_id: string;
  pacote_id: string;
  quantidade_creditos: number;
  valor_centavos: number;
  asaas_payment_id: string | null;
  status: StatusPedido;
  created_at: string;
  pago_em: string | null;
}

export interface GreennWebhookEvento {
  id: string;
  venda_id: string;
  evento: string;
  status: string;
  produto_id: string | null;
  produto_nome: string | null;
  email_cliente: string | null;
  processado: boolean;
  erro: string | null;
  recebido_em: string;
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

export type TipoProcessoInpi = "marca" | "patente" | "desenho_industrial";

export interface ProcessoInpi {
  id: string;
  user_id: string;
  numero_processo: string;
  tipo: TipoProcessoInpi;
  apelido: string | null;
  nome: string | null;
  situacao: string | null;
  titular: string | null;
  apresentacao: string | null;
  natureza: string | null;
  classe: string | null;
  despacho_codigo: string | null;
  despacho_descricao: string | null;
  despacho_data: string | null;
  numero_rpi: string | null;
  dados_atualizados_ate: string | null;
  ultima_verificacao_em: string | null;
  ativo: boolean;
  created_at: string;
}

export interface EventoProcessoInpi {
  id: string;
  processo_id: string;
  user_id: string;
  despacho_codigo: string | null;
  despacho_descricao: string;
  despacho_data: string | null;
  situacao: string | null;
  encontrado_em: string;
  lido: boolean;
  created_at: string;
}
