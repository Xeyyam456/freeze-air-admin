import type { Presence } from "@/types/attendance";

// İşdə olduğu müddət (bağlanmış seansların cəmi): "9 saat 2 dəq"
export function durationText(p: Presence) {
  return p.minutes ? `${Math.floor(p.minutes / 60)} saat ${p.minutes % 60} dəq` : "";
}
