import type { FlowEvent } from "@/types/dashboard";
import { bakuHour } from "./bakuHour";

// Saat oxunun aralığı: iş günü 08–20, hadisə kənara düşürsə genişlənir (cüt saata yuvarlanır, 0–24 arası)
export function flowRange(events: FlowEvent[], day: string, now: number | null): [number, number] {
  const hours = events.flatMap((e) => [bakuHour(e.at, day), e.end ? bakuHour(e.end, day) : NaN]).filter((h) => h >= 0 && h <= 24);
  if (now !== null) hours.push(now);
  const lo = Math.min(8, ...hours);
  const hi = Math.max(20, ...hours);
  return [Math.max(0, Math.floor(lo / 2) * 2), Math.min(24, Math.ceil(hi / 2) * 2)];
}
