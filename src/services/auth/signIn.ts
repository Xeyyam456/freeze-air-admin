import { createClient } from "@/lib/supabase/client";

// E-poçt + parolla giriş; uğurda true
export async function signIn(email: string, password: string): Promise<boolean> {
  const { error } = await createClient().auth.signInWithPassword({ email, password });
  return !error;
}
