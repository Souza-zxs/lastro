import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { abrirSessaoInpi, consultarProcesso } from "@/lib/inpi/cliente";
import { enviarEmail } from "@/lib/email";
import { enviarPushParaUsuario } from "@/lib/push";
import type { TipoProcessoInpi } from "@/lib/types";

const LOTE = 20;
const INTERVALO_ENTRE_VERIFICACOES_DIAS = 7; // a RPI só é publicada semanalmente

// Mesmo limite do job de monitoramento (app/api/jobs/monitorar) — 60s é o
// máximo do plano Hobby da Vercel. A sessão do INPI é aberta uma vez só e
// reaproveitada por todo o lote (handshake ~1,5s, cada consulta ~2-3s
// medido contra o site real, mais uma segunda ida na página de detalhe),
// então cabe tranquilo num lote de LOTE=20.
export const maxDuration = 60;

interface ProcessoParaVerificar {
  id: string;
  user_id: string;
  numero_processo: string;
  tipo: TipoProcessoInpi;
  situacao: string | null;
  despacho_descricao: string | null;
  usuarios: { nome: string; email: string; plano_id: string | null };
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const autorizacao = request.headers.get("authorization");

  if (!cronSecret || autorizacao !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const admin = getSupabaseAdminClient();
  const limite = new Date(Date.now() - INTERVALO_ENTRE_VERIFICACOES_DIAS * 24 * 60 * 60 * 1000).toISOString();

  const { data: processos, error } = (await admin
    .from("processos_inpi")
    .select(
      "id, user_id, numero_processo, tipo, situacao, despacho_descricao, usuarios!inner(nome, email, plano_id)"
    )
    .eq("ativo", true)
    // Só verifica processos de usuário com plano ativo — acompanhamento
    // de INPI deixou de ser um recurso gratuito (ver migration
    // 20260903010000_planos_assinatura.sql).
    .not("usuarios.plano_id", "is", null)
    .or(`ultima_verificacao_em.is.null,ultima_verificacao_em.lt.${limite}`)
    .limit(LOTE)) as { data: ProcessoParaVerificar[] | null; error: { message: string } | null };

  if (error) {
    return NextResponse.json({ error: "Falha ao buscar processos para verificar." }, { status: 500 });
  }

  const lista = processos ?? [];

  let eventosCriados = 0;
  let falhas = 0;
  let semMudanca = 0;

  // Um e-mail por usuário ao final do lote (resumo), não um por evento.
  const novosEventosPorUsuario = new Map<string, { nome: string; email: string; quantidade: number }>();

  if (lista.length === 0) {
    return NextResponse.json({ processosVerificados: 0, eventosCriados, semMudanca, falhas, emailsEnviados: 0 });
  }

  let cookie: string;
  try {
    cookie = await abrirSessaoInpi();
  } catch {
    return NextResponse.json({ error: "Falha ao abrir sessão no INPI." }, { status: 502 });
  }

  for (const processo of lista) {
    let resultado;
    try {
      resultado = await consultarProcesso({ cookie, numeroProcesso: processo.numero_processo, tipo: processo.tipo });
    } catch {
      falhas += 1;
      continue;
    }

    if (resultado.tipo === "nao_reconhecido") {
      // Página não bateu com o padrão esperado — não mexe no snapshot
      // salvo, só conta como falha pra investigar depois (ver
      // lib/inpi/cliente.ts).
      falhas += 1;
      continue;
    }

    if (resultado.tipo === "nao_encontrado") {
      try {
        await admin.rpc("marcar_processo_inpi_verificado", { p_processo_id: processo.id } as never);
      } catch {
        falhas += 1;
      }
      continue;
    }

    const mudou =
      resultado.situacao !== processo.situacao || resultado.despachoDescricao !== processo.despacho_descricao;

    const camposRicos = {
      p_numero_rpi: resultado.numeroRpi,
      p_dados_atualizados_ate: resultado.dadosAtualizadosAte,
      p_nome: resultado.nome,
      p_titular: resultado.titular,
      p_apresentacao: resultado.apresentacao,
      p_natureza: resultado.natureza,
      p_classe: resultado.classe,
    };

    try {
      if (mudou) {
        await admin.rpc("registrar_evento_processo_inpi", {
          p_processo_id: processo.id,
          p_despacho_codigo: null,
          p_despacho_descricao: resultado.despachoDescricao ?? resultado.situacao ?? "Atualização sem descrição.",
          p_despacho_data: resultado.despachoData,
          p_situacao: resultado.situacao,
          ...camposRicos,
        } as never);

        eventosCriados += 1;
        const resumo = novosEventosPorUsuario.get(processo.user_id) ?? {
          nome: processo.usuarios.nome,
          email: processo.usuarios.email,
          quantidade: 0,
        };
        resumo.quantidade += 1;
        novosEventosPorUsuario.set(processo.user_id, resumo);

        // Sem await no fluxo principal do lote — uma falha ou lentidão no
        // envio de push não pode atrasar a verificação dos outros
        // processos (mesmo raciocínio de tolerância a falha do e-mail).
        enviarPushParaUsuario(processo.user_id, {
          titulo: `Atualização: ${processo.numero_processo}`,
          corpo: resultado.situacao ?? resultado.despachoDescricao ?? "O processo teve uma atualização.",
          url: `/dashboard/inpi/${processo.id}`,
        }).catch(() => {});
      } else {
        await admin.rpc("marcar_processo_inpi_verificado", {
          p_processo_id: processo.id,
          ...camposRicos,
        } as never);
        semMudanca += 1;
      }
    } catch {
      falhas += 1;
    }
  }

  const origem = new URL(request.url).origin;
  let emailsEnviados = 0;
  for (const resumo of novosEventosPorUsuario.values()) {
    const enviado = await enviarEmail({
      para: resumo.email,
      assunto:
        resumo.quantidade === 1
          ? "Um processo do INPI que você acompanha teve atualização"
          : `${resumo.quantidade} processos do INPI que você acompanha tiveram atualização`,
      html: `<p>Olá, ${resumo.nome.split(" ")[0]}.</p>
<p>Encontramos ${resumo.quantidade === 1 ? "1 atualização" : `${resumo.quantidade} atualizações`} nos processos do INPI que você está acompanhando no Lastro.</p>
<p><a href="${origem}/dashboard/inpi">Ver no painel</a></p>`,
    });
    if (enviado) emailsEnviados += 1;
  }

  return NextResponse.json({
    processosVerificados: lista.length,
    eventosCriados,
    semMudanca,
    falhas,
    emailsEnviados,
  });
}
