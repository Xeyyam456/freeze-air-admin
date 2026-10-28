import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Bütün tətbiq üçün tək Supabase klienti (brauzerdə sessiya localStorage-da saxlanır).
// Təhlükəsizlik bazanın RLS qaydalarındadır: istifadəçi yalnız icazəsi olanı görür və dəyişir.
let client: SupabaseClient<Database> | null = null;

export function createClient() {
  client ??= createSupabaseClient<Database>(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  );
  return client;
}
