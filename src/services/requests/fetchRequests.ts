import { createClient } from "@/lib/supabase/client";

// Saytdan gələn müraciətlər (yenisi yuxarıda)
export async function fetchRequests() {
  const { data } = await createClient().from("contact_requests").select("*").order("created_at", { ascending: false });
  return data ?? [];
}
