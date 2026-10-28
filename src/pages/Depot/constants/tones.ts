import type { Tone } from "@/types/depot";

// Depo bölməsinin rəngləri (2026-10-23, istifadəçi: "bütün modallar pro versiya, modern rənglər").
// Palitra: alət göy, material firuzəyi, usta bənövşəyi, xəbərdarlıq kəhrəba, silinmə qırmızı, depoda yaşıl.
export const GRAD: Record<Tone, string> = {
  blue: "bg-[linear-gradient(135deg,#60a5fa,#2563eb)] shadow-[0_8px_18px_-6px_rgba(37,99,235,0.55)]",
  teal: "bg-[linear-gradient(135deg,#2dd4bf,#0d9488)] shadow-[0_8px_18px_-6px_rgba(13,148,136,0.55)]",
  violet: "bg-[linear-gradient(135deg,#a78bfa,#7c3aed)] shadow-[0_8px_18px_-6px_rgba(124,58,237,0.55)]",
  amber: "bg-[linear-gradient(135deg,#fbbf24,#d97706)] shadow-[0_8px_18px_-6px_rgba(217,119,6,0.55)]",
  red: "bg-[linear-gradient(135deg,#f87171,#dc2626)] shadow-[0_8px_18px_-6px_rgba(220,38,38,0.55)]",
  green: "bg-[linear-gradient(135deg,#4ade80,#16a34a)] shadow-[0_8px_18px_-6px_rgba(22,163,74,0.55)]",
  slate: "bg-[linear-gradient(135deg,#94a3b8,#475569)] shadow-[0_8px_18px_-6px_rgba(71,85,105,0.5)]",
};
export const SOFT: Record<Tone, string> = {
  blue: "bg-[#eef4ff] text-[#2563eb]",
  teal: "bg-[#e7f8f5] text-[#0f766e]",
  violet: "bg-[#f3efff] text-[#6d28d9]",
  amber: "bg-[#fff6e5] text-[#b45309]",
  red: "bg-[#fff0f0] text-[#dc2626]",
  green: "bg-[#ecfbf1] text-[#15803d]",
  slate: "bg-[#f1f4f8] text-[#475569]",
};
