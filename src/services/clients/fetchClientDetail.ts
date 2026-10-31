import { createClient } from "@/lib/supabase/client";
import type { ClientDetailData } from "@/types/clients";

// Şirkət/market və onun filialları (mağazaları)
export async function fetchClientDetail(id: number): Promise<ClientDetailData> {
  const supabase = createClient();
  const [{ data: client }, { data: units }] = await Promise.all([
    supabase.from("companies").select("*").eq("id", id).maybeSingle(),
    supabase.from("stores").select("*").eq("company_id", id).order("code"),
  ]);
  return { client, units: units ?? [] };
}
