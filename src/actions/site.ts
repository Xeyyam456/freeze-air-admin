import type { Database } from "@/lib/database.types";
import { text, type FormState } from "@/lib/form-state";
import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";

// Açıq saytın əlaqə məlumatları (tək sətir, id = 1). Saytda ən gec ~1 dəqiqəyə yenilənir.
export async function updateSiteSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData, "email");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "E-poçt düzgün deyil." };

  const { error } = await createClient()
    .from("site_settings")
    .update({
      phone: text(formData, "phone"),
      address: text(formData, "address"),
      hours: text(formData, "hours"),
      email,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

// Saytın şəkilləri (loqo, hero, "Haqqımızda"); null → saytda ikon / illüstrasiya
export type HomeImageField = "logo_url" | "hero_image_url" | "about_image_main_url" | "about_image_side_url";

export async function updateHomeImage(field: HomeImageField, url: string | null): Promise<string | null> {
  const { error } = await createClient()
    .from("site_settings")
    .update({ [field]: url, updated_at: new Date().toISOString() } as Database["public"]["Tables"]["site_settings"]["Update"])
    .eq("id", 1);
  if (error) return error.message;
  revalidate();
  return null;
}

// "Haqqımızda" mətnləri. Abzaslar boş sətirlə, siyahı bəndləri yeni sətirlə ayrılır.
export async function updateAbout(_prev: FormState, formData: FormData): Promise<FormState> {
  const { error } = await createClient()
    .from("site_settings")
    .update({
      about_title: text(formData, "about_title"),
      about_text: text(formData, "about_text"),
      about_points: text(formData, "about_points"),
      about_card_title: text(formData, "about_card_title"),
      about_card_text: text(formData, "about_card_text"),
      about_card_color: text(formData, "about_card_color") ?? "night",
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) return { error: error.code === "23514" ? "Mətnlərdən biri çox uzundur." : error.message };
  revalidate();
  return { ok: true };
}

// Saytın sabit mətnləri (site_texts): yalnız dəyişənlər göndərilir; boş mətn → saytda standart mətn
export async function saveTexts(values: Record<string, string>): Promise<string | null> {
  const now = new Date().toISOString();
  const rows = Object.entries(values).map(([key, value]) => ({ key, value: value.trim(), updated_at: now }));
  if (rows.length === 0) return null;
  const { error } = await createClient().from("site_texts").upsert(rows);
  if (error) return error.code === "23514" ? "Mətnlərdən biri çox uzundur." : error.message;
  revalidate();
  return null;
}
