// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
import type { Json } from "../Json"

export type Fn = {
  Args: { p_items: Json; p_note?: string }
  Returns: number
}
