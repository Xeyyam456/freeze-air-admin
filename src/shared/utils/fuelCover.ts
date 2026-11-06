import type { DayCover } from "@/types/fuel";

// Ayın pulları günlərə KÖHNƏDƏN YENİYƏ paylanır (mobil app ilə eyni qayda: mobile/src/shared/utils/fuelDebt.ts).
// Şirkət çox vaxt bir neçə günün pulunu birdən verir (06.11-də 45.66 ₼ → 02.11 + 06.11): həmin günlər "Ödənilib" sayılır.
// "Almadığını deyir" (disputed) ödənişi sayılmır. Nəticə: gün → { sərf, ödənilən }
export function coverDays(days: { day: string; cost: number }[], paid: number): Record<string, DayCover> {
  let pool = paid;
  const out: Record<string, DayCover> = {};
  for (const d of [...days].sort((a, b) => a.day.localeCompare(b.day))) {
    const covered = Math.min(pool, d.cost);
    pool = Math.max(0, pool - covered);
    out[d.day] = { cost: d.cost, covered };
  }
  return out;
}
