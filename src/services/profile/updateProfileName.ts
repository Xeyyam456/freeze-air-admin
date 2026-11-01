import { createClient } from "@/lib/supabase/client";

// Öz profil adını dəyişir; xəta mətni və ya null
export async function updateProfileName(userId: string, fullName: string): Promise<string | null> {
  const { error } = await createClient().from("profiles").update({ full_name: fullName }).eq("id", userId);
  return error?.message ?? null;
}
