import { addDays } from "./addDays";

// Panelin tarix aralıqları (Bakı vaxtı): bu ayın 1-i, son 30 gün, keçən ayın eyni dövrü (1-dən bu günə uyğun günə qədər)
export function panelRanges(today: string) {
  const [y, m, d] = today.split("-").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");
  const py = m === 1 ? y - 1 : y;
  const pm = m === 1 ? 12 : m - 1;
  const prevDays = new Date(py, pm, 0).getDate();
  return {
    y, m: m - 1, day: d,
    monthStart: `${y}-${pad(m)}-01`,
    from30: addDays(today, -29),
    prevStart: `${py}-${pad(pm)}-01`,
    prevTo: `${py}-${pad(pm)}-${pad(Math.min(d, prevDays))}`,
  };
}
