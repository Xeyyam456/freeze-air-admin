import { revalidateSite } from "@/lib/site";
import { createClient } from "@/lib/supabase/client";

// Saytın sabit mətnləri (site_texts): yalnız dəyişənlər göndərilir; boş mətn → saytda standart mətn
export async function saveTexts(values: Record<string, string>): Promise<string | null> {
  const now = new Date().toISOString();
  const rows = Object.entries(values).map(([key, value]) => ({ key, value: value.trim(), updated_at: now }));
  if (rows.length === 0) return null;
  const { error } = await createClient().from("site_texts").upsert(rows);
  if (error) return error.code === "23514" ? "Mətnlərdən biri çox uzundur." : error.message;
  revalidateSite();
  return null;
}

// Hero-dakı sürətli müraciət formu: göstər/gizlət (site_settings) və mətnləri (site_texts). Boş mətn → saytda standart mətn.
export async function saveHeroForm(enabled: boolean, texts: Record<string, string>): Promise<string | null> {
  const { error } = await createClient()
    .from("site_settings")
    .update({ hero_form_enabled: enabled, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) return error.message;
  return saveTexts(texts);
}
