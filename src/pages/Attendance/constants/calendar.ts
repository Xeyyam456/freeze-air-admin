import type { DayStatus, LegendItem } from "@/types/attendance";

export const WEEK = ["B.e", "Ç.a", "Ç", "C.a", "C", "Ş", "B"];
export const WEEKDAY = ["Bazar", "Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə"];

// Gün xanasının görünüşü: işdə yaşıl ✓, icazəli bənövşəyi, gəlmədi qırmızı, bazar tünd boz, gələcək solğun
export const CELL: Record<DayStatus, string> = {
  present: "bg-ok text-white",
  leave: "bg-violet-500 text-white",
  absent: "bg-danger text-white",
  pending: "bg-primary-soft text-primary ring-2 ring-primary",
  off: "bg-slate-400/25 text-slate-200",
  // Tünd temada boş günlər pəncərədən bir az açıq xana: rəqəm aydın oxunur (əvvəl bg-bg ilə "çökük" görünürdü)
  future: "bg-white/[0.07] text-ink/85 ring-1 ring-inset ring-white/[0.06]",
  before: "bg-white/[0.04] text-ink/45",
};

export const LEGEND: LegendItem[] = [
  { s: "present", label: "İşdə" },
  { s: "leave", label: "İcazəli" },
  { s: "absent", label: "Gəlmədi" },
  { s: "off", label: "Bazar (istirahət)" },
];
