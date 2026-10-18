import type { Tables } from "@/lib/database.types";
import { revalidateSite } from "@/lib/site";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "site";

export type SegmentInput = Omit<Tables<"site_segments">, "id" | "updated_at">;
export type ServiceInput = Omit<Tables<"site_services">, "id">;

// Ünvan üçün addan latın hərfli qısa ad: "Ev və mənzil" → "ev-ve-menzil"
export function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function errorText(e: { code?: string; message: string }) {
  if (e.code === "23505") return "Bu ünvan / açar artıq istifadə olunur, başqasını yazın.";
  if (e.code === "23514") return "Sahələrdən biri düzgün deyil (uzunluq və ya format).";
  return e.message;
}

// Obyekt növü: yeni (id yoxdur) və ya mövcud
export async function saveSegment(id: number | null, input: SegmentInput): Promise<string | null> {
  const supabase = createClient();
  const { error } = id
    ? await supabase.from("site_segments").update({ ...input, updated_at: new Date().toISOString() }).eq("id", id)
    : await supabase.from("site_segments").insert(input);
  if (error) return errorText(error);
  revalidateSite();
  return null;
}

export async function deleteSegment(id: number, imageUrl: string | null) {
  await removeSiteImage(imageUrl);
  await createClient().from("site_segments").delete().eq("id", id);
  revalidateSite();
}

export async function saveService(id: number | null, input: ServiceInput): Promise<string | null> {
  const supabase = createClient();
  const { error } = id
    ? await supabase.from("site_services").update(input).eq("id", id)
    : await supabase.from("site_services").insert(input);
  if (error) return errorText(error);
  revalidateSite();
  return null;
}

export async function deleteService(id: number, imageUrl: string | null) {
  await removeSiteImage(imageUrl);
  await createClient().from("site_services").delete().eq("id", id);
  revalidateSite();
}

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

export type EquipmentInput = Omit<Tables<"site_equipment">, "id">;

export async function saveEquipment(id: number | null, input: EquipmentInput): Promise<string | null> {
  const supabase = createClient();
  const { error } = id
    ? await supabase.from("site_equipment").update(input).eq("id", id)
    : await supabase.from("site_equipment").insert(input);
  if (error) return errorText(error);
  revalidateSite();
  return null;
}

export async function deleteEquipment(id: number, imageUrl: string | null) {
  await removeSiteImage(imageUrl);
  await createClient().from("site_equipment").delete().eq("id", id);
  revalidateSite();
}
