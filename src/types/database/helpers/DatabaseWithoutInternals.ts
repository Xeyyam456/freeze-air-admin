// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
import type { Database } from "../Database"

export type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

