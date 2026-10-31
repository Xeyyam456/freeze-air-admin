import { createClient } from "@/lib/supabase/client";
import type { Kind } from "@/lib/kinds";
import type { ClientListRow } from "@/types/clients";

// Şirkətlərin və ya market şəbəkələrinin siyahısı (filial/mağaza sayı ilə)
export async function fetchClients(kind: Kind): Promise<ClientListRow[]> {
  const { data } = await createClient()
    .from("companies")
    .select("id, name, phone, address, contact_person, stores(count)")
    .eq("kind", kind)
    .order("name");
  return data ?? [];
}
