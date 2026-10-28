// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
import type { Database } from "../Database"

export type Fn = {
  Args: { t: Database["public"]["Tables"]["tasks"]["Row"] }
  Returns: number
}
