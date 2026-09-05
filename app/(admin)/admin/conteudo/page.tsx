import { buscarConteudo, valorConteudo, CAMPOS_CONTEUDO } from "@/lib/conteudo";
import { salvarConteudoAdmin } from "@/lib/actions/conteudo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const dynamic = "force-dynamic";

export default async function AdminConteudoPage() {
  const mapa = await buscarConteudo();

  const secoes = Array.from(new Set(CAMPOS_CONTEUDO.map((c) => c.secao))).map((secao) => ({
    secao,
    secaoLabel: CAMPOS_CONTEUDO.find((c) => c.secao === secao)!.secaoLabel,
    campos: CAMPOS_CONTEUDO.filter((c) => c.secao === secao),
  }));

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-seal">Painel admin</p>
      <h1 className="mt-2 text-3xl text-ink">Textos do site</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Edite os textos que aparecem pros visitantes e usuários, sem precisar mexer no código. Um
        campo em branco volta a usar o texto padrão.
      </p>

      <div className="mt-10 space-y-12">
        {secoes.map(({ secao, secaoLabel, campos }) => (
          <section key={secao}>
            <h2 className="border-b border-line pb-2 text-lg text-ink">{secaoLabel}</h2>
            <form action={salvarConteudoAdmin} className="mt-5 space-y-5">
              {campos.map((campo) => (
                <div key={campo.chave} className="space-y-1.5">
                  <Label htmlFor={campo.chave}>{campo.label}</Label>
                  {campo.tipo === "textarea" ? (
                    <Textarea
                      id={campo.chave}
                      name={campo.chave}
                      defaultValue={valorConteudo(mapa, campo.chave)}
                      rows={3}
                    />
                  ) : (
                    <Input id={campo.chave} name={campo.chave} defaultValue={valorConteudo(mapa, campo.chave)} />
                  )}
                </div>
              ))}
              <Button type="submit">Salvar {secaoLabel.toLowerCase()}</Button>
            </form>
          </section>
        ))}
      </div>
    </div>
  );
}
