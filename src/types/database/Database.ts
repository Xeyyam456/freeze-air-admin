// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
import type { PublicTables } from "./tables"
import type { PublicViews } from "./views"
import type { PublicFunctions } from "./functions"

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: PublicTables
    Views: PublicViews
    Functions: PublicFunctions
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
