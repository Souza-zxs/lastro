import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { provedorAtivo } from "@/lib/monitoramento/provedor";
import { encontrarRegistroSemelhante, type CandidatoDedup } from "@/lib/monitoramento/dedup";
import { enviarEmail } from "@/lib/email";

const LOTE = 50;
const SIMILARIDADE_MINIMA = 90;
const INTERVALO_ENTRE_SCANS_DIAS = 7;

// Sem isso, a rota cai no timeout padrão da plataforma (10s no plano Hobby
// da Vercel) — não dá tempo nem de terminar 1 chamada externa. 60s é o
// máximo permitido no Hobby; se o lote inteiro não couber nesse tempo, a
// função é encerrada no meio — sem problema, já que só marcamos
// `ultimo_scan_em`/gravamos alertas registro a registro (nunca em lote
// numa única transação), então o que não coube fica pro próximo run.
export const maxDuration = 60;

interface RegistroParaScan {
  id: string;
  user_id: string;
  hash_perceptual: string | null;
  imagem_thumb: string;
  usuarios: { nome: string; email: string };
}

interface AlertaExistente {
  url_encontrada: string;
  dominio: string;
  similaridade: number;
  metodo: string;
  status: string;
}

interface CandidatoComAlertas extends CandidatoDedup {
  user_id: string;
  alertas_uso_indevido: AlertaExistente[];
}

/**
 * Job periódico de monitoramento de uso indevido. O Vercel Cron chama
 * rotas via GET e injeta `Authorization: Bearer $CRON_SECRET`
 * automaticamente quando essa env var existe no projeto (ver
 * vercel.json). Não é uma rota pensada para ser chamada pelo client.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const autorizacao = request.headers.get("authorization");

  if (!cronSecret || autorizacao !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const admin = getSupabaseAdminClient();
  const limiteScan = new Date(Date.now() - INTERVALO_ENTRE_SCANS_DIAS * 24 * 60 * 60 * 1000).toISOString();

  const { data: registros, error } = (await admin
    .from("registros")
    .select("id, user_id, hash_perceptual, imagem_thumb, usuarios!inner(monitoramento_ativo, nome, email)")
    .eq("usuarios.monitoramento_ativo", true)
    .or(`ultimo_scan_em.is.null,ultimo_scan_em.lt.${limiteScan}`)
    .limit(LOTE)) as { data: RegistroParaScan[] | null; error: { message: string } | null };

  if (error) {
    return NextResponse.json({ error: "Falha ao buscar registros para monitorar." }, { status: 500 });
  }

  const lista = registros ?? [];

  // Registros do mesmo usuário já escaneados antes, com os alertas que já
  // tinham — usados pra achar um "quase idêntico" e reaproveitar o
  // resultado em vez de pagar por uma nova chamada ao provedor de busca
  // reversa pra, efetivamente, a mesma imagem (ex.: a mesma foto registrada
  // duas vezes, ou uma variação mínima de recorte).
  const candidatosPorUsuario = new Map<string, CandidatoComAlertas[]>();
  if (lista.length > 0) {
    const userIds = [...new Set(lista.map((r) => r.user_id))];
    const { data: candidatos } = (await admin
      .from("registros")
      .select(
        "id, user_id, hash_perceptual, alertas_uso_indevido(url_encontrada, dominio, similaridade, metodo, status)"
      )
      .in("user_id", userIds)
      .not("hash_perceptual", "is", null)
      .not("ultimo_scan_em", "is", null)) as { data: CandidatoComAlertas[] | null };

    for (const candidato of candidatos ?? []) {
      const doUsuario = candidatosPorUsuario.get(candidato.user_id) ?? [];
      doUsuario.push(candidato);
      candidatosPorUsuario.set(candidato.user_id, doUsuario);
    }
  }

  let alertasCriados = 0;
  let falhas = 0;
  let reaproveitados = 0;

  // Um e-mail por usuário ao final do lote (resumo), não um por alerta —
  // evita spammar quem tiver vários registros com achados no mesmo run.
  const novosAlertasPorUsuario = new Map<string, { nome: string; email: string; quantidade: number }>();

  async function marcarEscaneado(registroId: string) {
    try {
      await admin
        .from("registros")
        .update({ ultimo_scan_em: new Date().toISOString() } as never)
        .eq("id", registroId);
    } catch {
      falhas += 1;
    }
  }

  async function registrarAlerta(
    registro: RegistroParaScan,
    url: string,
    similaridade: number,
    metodo: string
  ) {
    try {
      const dominio = new URL(url).hostname;
      const { error: alertaError, data: alerta } = await admin.rpc("registrar_alerta_uso_indevido", {
        p_registro_id: registro.id,
        p_url_encontrada: url,
        p_dominio: dominio,
        p_similaridade: similaridade,
        p_metodo: metodo,
      } as never);

      if (!alertaError && alerta) {
        alertasCriados += 1;
        const resumo = novosAlertasPorUsuario.get(registro.user_id) ?? {
          nome: registro.usuarios.nome,
          email: registro.usuarios.email,
          quantidade: 0,
        };
        resumo.quantidade += 1;
        novosAlertasPorUsuario.set(registro.user_id, resumo);
      }
    } catch {
      falhas += 1;
    }
  }

  for (const registro of lista) {
    const candidatosDoUsuario = (candidatosPorUsuario.get(registro.user_id) ?? []).filter(
      (c) => c.id !== registro.id
    );
    const semelhante = registro.hash_perceptual
      ? encontrarRegistroSemelhante(registro.hash_perceptual, candidatosDoUsuario)
      : null;

    if (semelhante) {
      const candidato = candidatosDoUsuario.find((c) => c.id === semelhante.id);
      // Não propaga alertas que o usuário já marcou como falso positivo
      // (ignorado) pro registro original — reaproveitar isso ressuscitaria
      // algo que a pessoa já dispensou conscientemente.
      const alertasReaproveitaveis = (candidato?.alertas_uso_indevido ?? []).filter(
        (a) => a.status !== "ignorado"
      );
      for (const alertaExistente of alertasReaproveitaveis) {
        await registrarAlerta(
          registro,
          alertaExistente.url_encontrada,
          alertaExistente.similaridade,
          `dedup:${alertaExistente.metodo}`
        );
      }
      await marcarEscaneado(registro.id);
      reaproveitados += 1;
      continue;
    }

    // Uma falha pontual (rate limit, timeout, imagem inacessível) não pode
    // derrubar o lote inteiro nem "queimar" o registro por 7 dias — só
    // marcamos `ultimo_scan_em` se a busca de fato rodou.
    let resultados;
    try {
      resultados = await provedorAtivo.buscar({
        imagemUrl: registro.imagem_thumb,
        hashPerceptual: registro.hash_perceptual,
      });
    } catch {
      falhas += 1;
      continue;
    }

    for (const resultado of resultados) {
      if (resultado.similaridade < SIMILARIDADE_MINIMA) continue;
      await registrarAlerta(registro, resultado.url, resultado.similaridade, provedorAtivo.nome);
    }

    await marcarEscaneado(registro.id);
  }

  const origem = new URL(request.url).origin;
  let emailsEnviados = 0;
  for (const resumo of novosAlertasPorUsuario.values()) {
    const enviado = await enviarEmail({
      para: resumo.email,
      assunto:
        resumo.quantidade === 1
          ? "Encontramos um possível uso indevido da sua imagem"
          : `Encontramos ${resumo.quantidade} possíveis usos indevidos das suas imagens`,
      html: `<p>Olá, ${resumo.nome.split(" ")[0]}.</p>
<p>O monitoramento do Lastro encontrou ${resumo.quantidade === 1 ? "1 novo alerta" : `${resumo.quantidade} novos alertas`} de possível uso indevido de imagens que você registrou.</p>
<p><a href="${origem}/dashboard/alertas">Ver os alertas no painel</a></p>`,
    });
    if (enviado) emailsEnviados += 1;
  }

  return NextResponse.json({
    registrosVerificados: lista.length,
    alertasCriados,
    reaproveitados,
    falhas,
    emailsEnviados,
    provedor: provedorAtivo.nome,
  });
}
