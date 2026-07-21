import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cadastrar } from "@/lib/actions/auth";

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <div className="border border-line bg-paper-certificate p-8">
      <h1 className="font-serif text-2xl text-ink">Criar conta</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Leva menos de um minuto. Seu primeiro certificado é por nossa conta.
      </p>

      {erro && (
        <div className="mt-5 flex items-start gap-2.5 border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {erro}
        </div>
      )}

      <form action={cadastrar} className="mt-7 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome completo</Label>
          <Input id="nome" name="nome" placeholder="Seu nome" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" placeholder="voce@exemplo.com" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="documento">CPF ou CNPJ (opcional)</Label>
          <Input id="documento" name="documento" placeholder="000.000.000-00" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="senha">Senha</Label>
          <Input id="senha" name="senha" type="password" placeholder="Crie uma senha" required minLength={6} />
        </div>
        <Button type="submit" className="w-full" size="lg">
          Criar conta grátis
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-ledger hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
