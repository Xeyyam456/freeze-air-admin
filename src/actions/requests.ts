import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";

// Saytdan gələn müraciət: "baxıldı" / "yeni" kimi işarələmək
export async function setRequestHandled(id: number, handled: boolean) {
  await createClient().from("contact_requests").update({ handled }).eq("id", id);
  revalidate();
}

export async function deleteRequest(id: number) {
  await createClient().from("contact_requests").delete().eq("id", id);
  revalidate();
}
