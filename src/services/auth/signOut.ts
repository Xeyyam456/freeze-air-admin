import { createClient } from "@/lib/supabase/client";

export async function signOut(): Promise<void> {
  await createClient().auth.signOut();
}
