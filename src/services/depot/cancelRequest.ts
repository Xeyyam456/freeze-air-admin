import { createClient } from "@/lib/supabase/client";

// Öz sənədini ləğv edir; xəta mətni və ya null
export async function cancelRequest(id: number): Promise<string | null> {
  const { error } = await createClient().rpc("depot_request_cancel", { p_id: id });
  return error?.message ?? null;
}
