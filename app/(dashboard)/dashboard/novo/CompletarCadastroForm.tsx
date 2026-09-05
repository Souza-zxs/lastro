import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { completarDadosTitular } from "@/lib/actions/titular";

export function CompletarCadastroForm({ erro }: { erro?: string }) {
  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-seal">Termine seu cadastro</p>
      <h1 className="mt-2 text-3xl text-ink">Falta pouco pra registrar sua primeira imagem.</h1>
      <p className="mt-2 text-ink-muted">
        Pra emitir um certificado de anterioridade válido, precisamos confirmar seu CPF ou CNPJ e
        seu endereço — eles fazem parte da identificação do titular no certificado.
      </p>

      {erro && (
        <div className="mt-5 flex items-start gap-2.5 border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {erro}
        </div>
      )}

      <form action={completarDadosTitular} className="mt-7 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="documento">CPF ou CNPJ</Label>
          <Input id="documento" name="documento" placeholder="000.000.000-00" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="endereco">Endereço completo</Label>
          <Input id="endereco" name="endereco" placeholder="Rua, número, bairro, cidade — UF" required />
        </div>
        <Button type="submit" className="w-full" size="lg">
          Continuar
        </Button>
      </form>
    </div>
  );
}
