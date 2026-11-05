import type { PanelPlaced } from "@/types/dashboard";

// İşin şirkəti: mağaza/filialın şirkəti, sabit məkanlı şirkət və ya siyahıda olmayan yer
export function placeName(p: PanelPlaced) {
  return p.stores?.companies?.name ?? p.companies?.name ?? "Siyahıda olmayan yer";
}
