import { createClient } from "@/lib/supabase/client";
import type { HomeData, SiteSettings, TextMap } from "@/types/site";
import type { SortedTable } from "@/types/site";

export async function fetchSorted<T extends SortedTable>(table: T) {
  const { data } = await createClient().from(table).select("*").order("sort").order("id");
  return data ?? [];
}

export async function fetchSettings(): Promise<SiteSettings | null> {
  const { data } = await createClient().from("site_settings").select("*").eq("id", 1).maybeSingle();
  return data;
}

// Bütün sabit mətnlər: açar → dəyər
export async function fetchAllTexts(): Promise<Record<string, string>> {
  const { data } = await createClient().from("site_texts").select("key, value");
  return Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
}

// Ana səhifə tabı: ayarlar + önizləmədə göstərilən bir neçə mətn
export async function fetchHomeData(keys: string[]): Promise<HomeData> {
  const supabase = createClient();
  const [{ data: settings }, { data: texts }] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("site_texts").select("key, value").in("key", keys),
  ]);
  const t: TextMap = Object.fromEntries((texts ?? []).map((r) => [r.key, r.value]));
  return { settings, t };
}
