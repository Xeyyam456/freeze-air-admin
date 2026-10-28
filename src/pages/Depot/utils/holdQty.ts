import { fmt } from "./quantity";
import type { Holding, Tool } from "@/types/depot";

// Bir ustadakı say: "×2" (alət) | "5 metr" (material)
export function holdQty(h: Holding, t: Tool) {
  return t.kind === "material" ? `${fmt(h.quantity)} ${t.unit}` : h.quantity > 1 ? `×${h.quantity}` : "";
}
