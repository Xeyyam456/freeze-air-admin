import { createClient } from "@/lib/supabase/client";

// Əməkdaşın telefonunu dəyişir; xəta mətni və ya null
export async function updateEmployeePhone(id: number, phone: string | null): Promise<string | null> {
  const { error } = await createClient().from("employees").update({ phone }).eq("id", id);
  return error?.message ?? null;
}
