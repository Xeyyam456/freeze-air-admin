import { listAccountEmails } from "@/actions/accounts";
import { createClient } from "@/lib/supabase/client";
import type { ManagersData } from "@/types/management";

export async function fetchManagers(admin: boolean): Promise<ManagersData> {
  const [{ data: managers }, emails] = await Promise.all([
    createClient().from("employees").select("*").eq("is_management", true).eq("is_active", true).order("full_name"),
    // Giriş hesablarının e-poçtları: yalnız admin görür, Edge Function verir
    admin ? listAccountEmails() : Promise.resolve(null),
  ]);
  return { managers: managers ?? [], emails };
}
