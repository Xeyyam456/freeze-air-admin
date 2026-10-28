// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
import type { Database } from "../Database"
import type { DatabaseWithoutInternals } from "./DatabaseWithoutInternals"

export type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

