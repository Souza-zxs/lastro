import "server-only";

const BASE_URL =
  process.env.ASAAS_ENV === "production" ? "https://api.asaas.com/v3" : "https://api-sandbox.asaas.com/v3";

function requireApiKey() {
  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) {
    throw new Error("Asaas não configurado: defina ASAAS_API_KEY em .env.local");
  }
  return apiKey;
}

async function asaasFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      access_token: requireApiKey(),
      ...init?.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const mensagem = data?.errors?.[0]?.description ?? `Asaas respondeu ${response.status}`;
    throw new Error(mensagem);
  }

  return data as T;
}

interface AsaasCustomer {
  id: string;
}

/**
 * Busca um cliente existente pelo CPF/CNPJ ou cria um novo. O Asaas não
 * impede clientes duplicados com o mesmo documento, então buscamos antes
 * de criar — evita acumular um cliente novo a cada compra de quem ainda
 * não tem `asaas_customer_id` salvo.
 */
export async function criarOuBuscarCliente(params: { nome: string; email: string; cpfCnpj: string }): Promise<string> {
  const existentes = await asaasFetch<{ data: AsaasCustomer[] }>(
    `/customers?cpfCnpj=${encodeURIComponent(params.cpfCnpj)}`
  );

  if (existentes.data.length > 0) {
    return existentes.data[0].id;
  }

  const criado = await asaasFetch<AsaasCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify({
      name: params.nome,
      email: params.email,
      cpfCnpj: params.cpfCnpj,
    }),
  });

  return criado.id;
}

interface AsaasCobranca {
  id: string;
  invoiceUrl: string;
}

/**
 * Cria uma cobrança com o pagador livre para escolher Pix, boleto ou
 * cartão na página hospedada do Asaas (`invoiceUrl`) — não processamos
 * nenhum dado de pagamento diretamente.
 */
export async function criarCobranca(params: {
  customerId: string;
  valorCentavos: number;
  descricao: string;
  externalReference: string;
  successUrl: string;
}): Promise<AsaasCobranca> {
  const hoje = new Date();
  const vencimento = new Date(hoje.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return asaasFetch<AsaasCobranca>("/payments", {
    method: "POST",
    body: JSON.stringify({
      customer: params.customerId,
      billingType: "UNDEFINED",
      value: params.valorCentavos / 100,
      dueDate: vencimento,
      description: params.descricao,
      externalReference: params.externalReference,
      callback: { successUrl: params.successUrl, autoRedirect: true },
    }),
  });
}

export async function cancelarCobranca(paymentId: string): Promise<void> {
  await asaasFetch(`/payments/${paymentId}`, { method: "DELETE" });
}
