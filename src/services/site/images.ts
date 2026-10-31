import { createClient } from "@/lib/supabase/client";

const BUCKET = "site";

// Şəkli ən çox 1600px enə kiçildib WebP edir (nisbət saxlanır)
async function toWebp(file: File, maxSide = 1600): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Şəkil çevrilmədi."))), "image/webp", 0.85));
}

// Saytın şəkil bucket-inə yükləyir, açıq linki qaytarır
export async function uploadSiteImage(file: File, folder: string): Promise<string> {
  const blob = await toWebp(file);
  const path = `${folder}/${crypto.randomUUID()}.webp`;
  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: "image/webp" });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

// Bizim bucket-dəki köhnə şəkli silir (xarici linklərə toxunmur)
export async function removeSiteImage(url: string | null) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  if (!url?.includes(marker)) return;
  await createClient().storage.from(BUCKET).remove([url.split(marker)[1]]);
}
