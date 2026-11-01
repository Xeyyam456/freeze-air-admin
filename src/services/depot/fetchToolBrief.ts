import { createClient } from "@/lib/supabase/client";
import type { ToolBrief } from "@/types/depot";

// Bildirişlər üçün alətin qısa məlumatı (ad, növ, vahid)
export async function fetchToolBrief(id: number): Promise<ToolBrief | null> {
  const { data } = await createClient().from("tools").select("name, kind, unit").eq("id", id).maybeSingle();
  return data;
}
