import { NextResponse } from "next/server";
import { THUMBNAIL_BUCKET } from "@/lib/constants";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Registro } from "@/lib/types";

const HASH_PATTERN = /^[0-9a-f]{64}$/i;
const PHASH_PATTERN = /^[0-9a-f]{16}$/i;

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "É necessário estar autenticado." }, { status: 401 });
  }

  const formData = await request.formData();

  const titulo = formData.get("titulo");
  const categoria = formData.get("categoria");
  const hash = formData.get("hash_sha256");
  const hashPerceptual = formData.get("hash_perceptual");
  const formato = formData.get("formato");
  const dimensoes = formData.get("dimensoes");
  const tamanhoBytesRaw = formData.get("tamanho_bytes");
  const thumbnail = formData.get("thumbnail");

  if (
    typeof titulo !== "string" ||
    !titulo.trim() ||
    typeof categoria !== "string" ||
    !categoria.trim() ||
    typeof hash !== "string" ||
    !HASH_PATTERN.test(hash) ||
    (hashPerceptual !== null && (typeof hashPerceptual !== "string" || !PHASH_PATTERN.test(hashPerceptual))) ||
    typeof formato !== "string" ||
    typeof dimensoes !== "string" ||
    typeof tamanhoBytesRaw !== "string" ||
    !Number.isFinite(Number(tamanhoBytesRaw)) ||
    !(thumbnail instanceof Blob)
  ) {
    return NextResponse.json({ error: "Dados de registro inválidos." }, { status: 400 });
  }

  const thumbnailPath = `${user.id}/${crypto.randomUUID()}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from(THUMBNAIL_BUCKET)
    .upload(thumbnailPath, thumbnail, { contentType: "image/jpeg" });

  if (uploadError) {
    return NextResponse.json({ error: "Falha ao enviar a miniatura." }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(THUMBNAIL_BUCKET).getPublicUrl(thumbnailPath);

  const { data, error } = await supabase
    .rpc("criar_registro", {
      p_titulo: titulo,
      p_categoria: categoria,
      p_hash_sha256: hash.toLowerCase(),
      p_imagem_thumb: publicUrl,
      p_formato: formato,
      p_dimensoes: dimensoes,
      p_tamanho_bytes: Number(tamanhoBytesRaw),
      p_hash_perceptual: hashPerceptual ? (hashPerceptual as string).toLowerCase() : null,
    })
    .single();

  if (error) {
    if (error.message.includes("creditos_insuficientes")) {
      return NextResponse.json(
        {
          error: "Você não tem créditos suficientes para registrar uma imagem.",
          codigo: "creditos_insuficientes",
        },
        { status: 402 }
      );
    }
    return NextResponse.json({ error: "Falha ao criar o registro." }, { status: 500 });
  }

  return NextResponse.json(data as Registro, { status: 201 });
}
