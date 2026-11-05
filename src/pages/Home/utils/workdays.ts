import { addDays } from "./addDays";

// [from, to] arasındakı günlərin sayı (gündəlik orta üçün). Həftə 7 gündür: bazar günü də işə çıxılır (istifadəçi, 2026-11-05)
export function workdays(from: string, to: string) {
  let n = 0;
  for (let d = from; d <= to; d = addDays(d, 1)) n += 1;
  return Math.max(1, n);
}
