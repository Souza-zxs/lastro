"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { UploadCloud, X, ArrowRight, Download, RotateCcw, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CertificadoPreview } from "@/components/CertificadoPreview";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/format";
import { computeSha256Hex } from "@/lib/hash";
import { computePerceptualHashHex } from "@/lib/phash";
import { createThumbnail } from "@/lib/thumbnail";
import type { Registro } from "@/lib/types";

type Etapa = "formulario" | "processando" | "concluido";

export function NovoRegistroForm({ creditosDisponiveis }: { creditosDisponiveis: number }) {
  const [etapa, setEtapa] = useState<Etapa>("formulario");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [arrastando, setArrastando] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("Fotografia");
  const [resultado, setResultado] = useState<Registro | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [semCreditos, setSemCreditos] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function carregarArquivo(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    setArquivo(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!arquivo || !preview || !titulo) return;

    setErro(null);
    setSemCreditos(false);
    setEtapa("processando");

    try {
      const [hash, hashPerceptual, thumb] = await Promise.all([
        computeSha256Hex(arquivo),
        computePerceptualHashHex(arquivo),
        createThumbnail(arquivo),
      ]);

      const formData = new FormData();
      formData.set("titulo", titulo);
      formData.set("categoria", categoria);
      formData.set("hash_sha256", hash);
      formData.set("hash_perceptual", hashPerceptual);
      formData.set("formato", arquivo.type.split("/")[1]?.toUpperCase() ?? "IMG");
      formData.set("dimensoes", `${thumb.width} × ${thumb.height} px`);
      formData.set("tamanho_bytes", String(arquivo.size));
      formData.set("thumbnail", thumb.blob, "thumbnail.jpg");

      const response = await fetch("/api/registros", { method: "POST", body: formData });
      const data = await response.json();

      if (!response.ok) {
        setErro(data.error ?? "Não foi possível concluir o registro.");
        setSemCreditos(data.codigo === "creditos_insuficientes");
        setEtapa("formulario");
        return;
      }

      setResultado(data as Registro);
      setEtapa("concluido");
    } catch {
      setErro("Não foi possível concluir o registro. Tente novamente.");
      setEtapa("formulario");
    }
  }

  function reiniciar() {
    setEtapa("formulario");
    setArquivo(null);
    setPreview(null);
    setTitulo("");
    setCategoria("Fotografia");
    setResultado(null);
    setErro(null);
  }

  if (etapa === "concluido" && resultado) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-seal">
          Registro concluído
        </p>
        <h1 className="mt-2 text-3xl text-ink">Seu certificado está pronto.</h1>
        <p className="mt-2 text-ink-muted">
          Guarde o código de verificação — qualquer pessoa pode usá-lo para
          conferir a autenticidade deste registro.
        </p>

        <CertificadoPreview registro={resultado} className="mt-8" />

        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" className="gap-2" onClick={() => window.print()}>
            <Download className="size-4" />
            Baixar certificado (PDF)
          </Button>
          <Button size="lg" variant="outline" className="gap-2" onClick={reiniciar}>
            <RotateCcw className="size-4" />
            Registrar outra imagem
          </Button>
          <Link href="/dashboard" className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}>
            Ver no painel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-seal">Novo registro</p>
      <h1 className="mt-2 text-3xl text-ink">Registrar uma imagem</h1>
      <p className="mt-2 max-w-xl text-ink-muted">
        Este registro consome 1 crédito. Você tem{" "}
        <strong className="text-ink">{creditosDisponiveis}</strong> disponíveis.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <Label>Imagem</Label>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setArrastando(true);
            }}
            onDragLeave={() => setArrastando(false)}
            onDrop={(e) => {
              e.preventDefault();
              setArrastando(false);
              carregarArquivo(e.dataTransfer.files?.[0]);
            }}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "relative mt-2 flex aspect-4/3 cursor-pointer flex-col items-center justify-center overflow-hidden border-2 border-dashed bg-paper-certificate/50 transition-colors",
              arrastando ? "border-ledger bg-secondary" : "border-line hover:border-ledger/50"
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => carregarArquivo(e.target.files?.[0])}
            />
            {preview ? (
              <>
                <img src={preview} alt="Pré-visualização" className="absolute inset-0 h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setArquivo(null);
                    setPreview(null);
                  }}
                  className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-ink/70 text-paper hover:bg-ink"
                  aria-label="Remover imagem"
                >
                  <X className="size-4" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 px-6 text-center">
                <UploadCloud className="size-7 text-ink-muted" />
                <p className="text-sm font-medium text-ink">Arraste a imagem ou clique para selecionar</p>
                <p className="text-xs text-ink-muted">JPG, PNG ou WEBP — o arquivo não sai do seu navegador</p>
              </div>
            )}
          </div>
          {arquivo && (
            <p className="mt-2 truncate text-xs text-ink-muted">
              {arquivo.name} · {formatBytes(arquivo.size)}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="titulo">Título da obra</Label>
            <Input
              id="titulo"
              placeholder="Ex.: Retrato Urbano — Série SP"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="categoria">Categoria</Label>
            <Select value={categoria} onValueChange={(value) => value && setCategoria(value)}>
              <SelectTrigger id="categoria" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fotografia">Fotografia</SelectItem>
                <SelectItem value="Ilustração">Ilustração</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-2 border border-line bg-paper-certificate/60 p-4 text-xs leading-relaxed text-ink-muted">
            Ao registrar, geramos um hash SHA-256 do arquivo e um carimbo de
            tempo com a data e hora atuais. Esses dados compõem o seu
            certificado de anterioridade.
          </div>

          {erro && (
            <div className="flex items-start gap-2.5 border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <div>
                {erro}
                {semCreditos && (
                  <Link href="/precos" className="mt-2 block font-medium underline underline-offset-2">
                    Ver planos e pacotes de créditos
                  </Link>
                )}
              </div>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={!arquivo || !titulo || etapa === "processando"}
            className="mt-2 gap-2"
          >
            {etapa === "processando" ? (
              "Gerando carimbo de tempo…"
            ) : (
              <>
                Registrar imagem (1 crédito)
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
