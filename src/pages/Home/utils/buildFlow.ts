import type { FlowData, FlowEvent } from "@/types/dashboard";
import { bakuDay } from "./bakuDay";
import { shiftDay } from "./shiftDay";

// Seçilmiş günün hadisələri (həmin gün başlayan və ya günü keçən müddətlər) və son 14 günün zolaq sayları.
// "Davam edir" yalnız bu gün üçün: keçmiş gündə sonu olmayan müddət günün sonunda kəsilir.
export function buildFlow(all: FlowEvent[], day: string, today: string): FlowData {
  const days = Array.from({ length: 14 }, (_, i) => shiftDay(day, i - 13));
  const index = new Map(days.map((d, i) => [d, i]));
  const pulse: Record<string, number[]> = {};
  for (const e of all) {
    const i = index.get(bakuDay(e.at));
    if (i === undefined) continue;
    (pulse[e.lane] ??= Array(14).fill(0))[i] += 1;
  }

  const start = Date.parse(`${day}T00:00:00+04:00`);
  const end = start + 86_400_000;
  const events = all
    .filter((e) => {
      const a = Date.parse(e.at);
      const b = e.end ? Date.parse(e.end) : e.ongoing && day === today ? Date.now() : a;
      return a < end && b >= start;
    })
    .map((e) => ({ ...e, ongoing: !!e.ongoing && !e.end && day === today }));
  return { events, days, pulse };
}
