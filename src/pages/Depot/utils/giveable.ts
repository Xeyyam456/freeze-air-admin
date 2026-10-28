import type { DepotRequest, Tool } from "@/types/depot";

// Ustanın istəyi depodan verilə bilərmi (0086): depodakı boş say istənəndən az deyilsə bəli. Başqa sənədlərdə null.
export function giveable(r: DepotRequest, tool: Tool | undefined) {
  if (r.type !== "request") return null;
  return !!tool && tool.available >= (r.quantity ?? 0);
}
