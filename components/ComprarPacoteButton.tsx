"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ComprarPacoteButtonProps {
  pacoteId: string;
  nome: string;
  logado: boolean;
  destaque: boolean;
}

export function ComprarPacoteButton({ pacoteId, nome, logado, destaque }: ComprarPacoteButtonProps) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pedeDocumento, setPedeDocumento] = useState(false);
  const [documento, setDocumento] = useState("");

  if (!logado) {
    return (
      <Link
        href="/cadastro"
        className={cn(buttonVariants({ variant: destaque ? "default" : "outline", size: "lg" }), "mt-8 w-full")}
      >
        Selecionar {nome.toLowerCase()}
      </Link>
    );
  }

  async function comprar() {
    setCarregando(true);
    setErro(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pacoteId, documento: documento.replace(/\D/g, "") || undefined }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (data?.error === "cpf_cnpj_obrigatorio") {
          setPedeDocumento(true);
          setErro(
            documento
              ? "CPF ou CNPJ inválido. Confira e tente de novo."
              : "Informe seu CPF ou CNPJ para gerar a cobrança."
          );
          return;
        }
        setErro(data?.error ?? "Não foi possível concluir a compra.");
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch {
      setErro("Não foi possível concluir a compra. Verifique sua conexão e tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="mt-8">
      {pedeDocumento && (
        <input
          type="text"
          inputMode="numeric"
          placeholder="CPF ou CNPJ"
          value={documento}
          onChange={(event) => setDocumento(event.target.value)}
          className="mb-2 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
        />
      )}
      <button
        type="button"
        onClick={comprar}
        disabled={carregando}
        className={cn(buttonVariants({ variant: destaque ? "default" : "outline", size: "lg" }), "w-full")}
      >
        {carregando ? "Processando…" : `Selecionar ${nome.toLowerCase()}`}
      </button>
      {erro && <p className="mt-2 text-xs text-destructive">{erro}</p>}
    </div>
  );
}
