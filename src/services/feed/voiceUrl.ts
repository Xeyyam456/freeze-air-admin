import { createClient } from "@/lib/supabase/client";

// Səs şərhini oxutmaq üçün imzalı link (bucket gizlidir): 1 saat
export async function voiceUrl(path: string): Promise<string> {
  const { data, error } = await createClient().storage.from("feed-audio").createSignedUrl(path, 3600);
  if (error || !data) throw new Error(error?.message ?? "Səs faylı tapılmadı");
  return data.signedUrl;
}
