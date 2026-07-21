import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login } from "@/lib/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <div className="border border-line bg-paper-certificate p-8">
      <h1 className="font-serif text-2xl text-ink">Entrar</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Acesse seus registros e certificados.
      </p>

      {erro && (
        <div className="mt-5 flex items-start gap-2.5 border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {erro}
        </div>
      )}

      <form action={login} className="mt-7 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" placeholder="voce@exemplo.com" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="senha">Senha</Label>
          <Input id="senha" name="senha" type="password" placeholder="••••••••" required />
        </div>
        <Button type="submit" className="w-full" size="lg">
          Entrar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-medium text-ledger hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
