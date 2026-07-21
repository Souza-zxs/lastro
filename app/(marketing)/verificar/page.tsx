"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { registroDemo } from "@/lib/demo-data";

const exemplo = registroDemo;

export default function VerificarPage() {
  const [codigo, setCodigo] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!codigo.trim()) return;
    router.push(`/verificar/${codigo.trim().toUpperCase()}`);
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-6 py-20">
      <ShieldCheck className="size-8 text-ledger" />
      <h1 className="mt-4 text-3xl text-ink">Verificar um certificado</h1>
      <p className="mt-2 text-ink-muted">
        Digite o código de verificação impresso no certificado ou lido a
        partir do QR code para conferir sua autenticidade.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="codigo">Código de verificação</Label>
          <Input
            id="codigo"
            placeholder="XXXX-XXXX-XXXX"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className="font-mono uppercase"
            required
          />
        </div>
        <Button type="submit" size="lg" className="w-full gap-2">
          Verificar
          <ArrowRight className="size-4" />
        </Button>
      </form>

      <p className="mt-8 text-sm text-ink-muted">
        Quer testar antes? Veja um exemplo com o código{" "}
        <button
          type="button"
          onClick={() => router.push(`/verificar/${exemplo.codigo_verificacao}`)}
          className="font-mono font-medium text-ledger hover:underline"
        >
          {exemplo.codigo_verificacao}
        </button>
        .
      </p>
    </div>
  );
}
