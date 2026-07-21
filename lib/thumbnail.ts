interface ThumbnailResult {
  blob: Blob;
  width: number;
  height: number;
}

export async function createThumbnail(
  file: File,
  { maxWidth = 400, quality = 0.8 }: { maxWidth?: number; quality?: number } = {}
): Promise<ThumbnailResult> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  const scale = Math.min(1, maxWidth / width);
  const targetWidth = Math.round(width * scale);
  const targetHeight = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível gerar a miniatura da imagem");
  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );
  if (!blob) throw new Error("Não foi possível gerar a miniatura da imagem");

  return { blob, width, height };
}
