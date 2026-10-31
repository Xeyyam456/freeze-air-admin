import type { PersonStatus } from "@/types/employees";

export const STATUS_TONE: Record<PersonStatus["kind"], { dot: string; pill: string }> = {
  in: { dot: "bg-ok", pill: "bg-ok-soft text-ok" },
  done: { dot: "bg-[#98a2b3]", pill: "bg-bg text-muted" },
  leave: { dot: "bg-amber-500", pill: "bg-[#fff6e5] text-amber-700" },
  none: { dot: "", pill: "bg-bg text-muted" },
};

// Zolağın rəngi əməkdaşa görə dəyişir (id-yə görə sabit): kartlar bir-birindən fərqlənsin
export const BANDS = [
  "bg-[linear-gradient(120deg,#0b1324,#11243a_55%,#0f3d4c)]", // tünd göy-firuzəyi
  "bg-[linear-gradient(120deg,#1e1b4b,#312e81_55%,#4f46e5)]", // indiqo
  "bg-[linear-gradient(120deg,#022c22,#065f46_55%,#10b981)]", // zümrüd
  "bg-[linear-gradient(120deg,#2e1065,#5b21b6_55%,#8b5cf6)]", // bənövşəyi
  "bg-[linear-gradient(120deg,#4c0519,#9f1239_55%,#f43f5e)]", // bordo-qırmızı
  "bg-[linear-gradient(120deg,#083344,#0e7490_55%,#22d3ee)]", // buz mavisi
  "bg-[linear-gradient(120deg,#0f172a,#334155_55%,#64748b)]", // polad
];
