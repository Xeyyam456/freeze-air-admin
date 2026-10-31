import { createClient } from "@/lib/supabase/client";
import type { ErrorCodesData } from "@/types/errorCodes";

// Modellər (ada görə) və bütün xəta kodları
export async function fetchErrorCodes(): Promise<ErrorCodesData> {
  const supabase = createClient();
  const [models, codes] = await Promise.all([
    supabase.from("ac_models").select("id, name").order("name").then((r) => r.data ?? []),
    supabase.from("ac_error_codes").select("id, model_id, code, title, solution").order("code").then((r) => r.data ?? []),
  ]);
  return { models: models.sort((a, b) => a.name.localeCompare(b.name, "az")), codes };
}
