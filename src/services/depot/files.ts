import { createClient } from "@/lib/supabase/client";

// Qaimə və ya xarab alətin şəkli (istəyə görə): qapalı "depot" bucket-i; şəkil brauzerdə WebP-yə (≤1600px), PDF olduğu kimi
export async function uploadDepotFile(file: File | null): Promise<{ path: string | null; error?: string }> {
  if (!file || file.size === 0) return { path: null };
  const supabase = createClient();
  let body: Blob = file;
  let ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  let type = file.type;
  if (file.type.startsWith("image/") && file.type !== "image/heic") {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    body = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Şəkil çevrilmədi."))), "image/webp", 0.85));
    ext = "webp";
    type = "image/webp";
  }
  const path = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("depot").upload(path, body, { contentType: type });
  return error ? { path: null, error: `Fayl yüklənmədi: ${error.message}` } : { path };
}

// Sənədin faylına bir saatlıq link
export async function depotFileUrl(path: string) {
  const { data } = await createClient().storage.from("depot").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
