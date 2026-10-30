import { MONTHS_AZ } from "@/shared/utils/monthsAz";
import type { Period } from "@/types/fuel";
import { addDays, addMonths, d12, dayName, numDate } from "./dates";

// Dövrün aralığı və adı: gün; həftə = şirkətin iş həftəsi, 6 gün (bazar ertəsi – şənbə, bazar istirahət); ay.
// workdays: dövrdəki iş günlərinin sayı (bazarsız), "5 / 6 iş günü" yazmaq üçün; short/full: dar ekranda tarix (admin)
export function rangeOf(period: Period, anchor: string) {
  if (period === "day") return { from: anchor, to: anchor, label: dayName(anchor), short: numDate(anchor), full: numDate(anchor), workdays: 1 };
  if (period === "week") {
    const from = addDays(anchor, -((d12(anchor).getUTCDay() + 6) % 7));
    const to = addDays(from, 5);
    const same = from.slice(5, 7) === to.slice(5, 7);
    return { from, to, label: same ? `${Number(from.slice(8))}–${dayName(to)}` : `${dayName(from)} – ${dayName(to)}`, short: `${numDate(from).slice(0, 5)} – ${numDate(to)}`, full: `${numDate(from)} – ${numDate(to)}`, workdays: 6 };
  }
  const from = `${anchor.slice(0, 7)}-01`;
  const to = addDays(addMonths(from, 1), -1);
  let workdays = 0;
  for (let d = from; d <= to; d = addDays(d, 1)) if (d12(d).getUTCDay() !== 0) workdays++;
  const month = `${MONTHS_AZ[Number(anchor.slice(5, 7)) - 1]} ${anchor.slice(0, 4)}`;
  return { from, to, label: month, short: month, full: month, workdays };
}
