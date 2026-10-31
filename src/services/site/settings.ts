import { text } from "@/lib/form-state";
import { revalidateSite } from "@/lib/site";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import type { HomeImageField } from "@/types/site";
import type { FormState } from "@/types/shared";

// Açıq saytın əlaqə məlumatları (tək sətir, id = 1). Saytda ən gec ~1 dəqiqəyə yenilənir.
export async function updateSiteSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData, "email");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "E-poçt düzgün deyil." };
  // Sosial şəbəkə linkləri (footer): yalnız https://
  const instagram = text(formData, "instagram_url");
  const facebook = text(formData, "facebook_url");
  for (const [name, url] of [["Instagram", instagram], ["Facebook", facebook]] as const) {
    if (url && !/^https:\/\/\S+$/i.test(url)) return { error: `${name} linki https:// ilə başlamalıdır.` };
  }

  const { error } = await createClient()
    .from("site_settings")
    .update({
      phone: text(formData, "phone"),
      address: text(formData, "address"),
      hours: text(formData, "hours"),
      email,
      instagram_url: instagram,
      facebook_url: facebook,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) return { error: error.message };
  revalidateSite();
  return { ok: true };
}

export async function updateHomeImage(field: HomeImageField, url: string | null): Promise<string | null> {
  const { error } = await createClient()
    .from("site_settings")
    .update({ [field]: url, updated_at: new Date().toISOString() } as Database["public"]["Tables"]["site_settings"]["Update"])
    .eq("id", 1);
  if (error) return error.message;
  revalidateSite();
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
  revalidateSite();
  return { ok: true };
}
