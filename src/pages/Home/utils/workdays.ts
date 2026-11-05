import { addDays } from "./addDays";

// [from, to] arasında iş günlərinin sayı: şirkətin iş həftəsi 6 gündür (bazar istirahət)
export function workdays(from: string, to: string) {
  let n = 0;
  for (let d = from; d <= to; d = addDays(d, 1)) if (new Date(`${d}T12:00:00Z`).getUTCDay() !== 0) n += 1;
  return Math.max(1, n);
}
