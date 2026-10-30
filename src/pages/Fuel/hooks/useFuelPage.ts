import { useMemo, useState } from "react";
import { todayBaku } from "@/shared/utils/todayBaku";
import type { CarSummary, PayTarget, Period } from "@/types/fuel";
import { useFuelData } from "../queries/useFuelData";
import { addDays, addMonths } from "../shared/dates";
import { rangeOf } from "../shared/rangeOf";
import { buildCars } from "../utils/buildCars";

// Səhifənin vəziyyəti: dövr (gün / həftə / ay) və tarixi, başlıqda seçilmiş usta, açıq kartlar, "Pul ver" pəncərəsi
export function useFuelPage() {
  const today = todayBaku();
  const [period, setPeriod] = useState<Period>("week");
  const [anchor, setAnchor] = useState(today);
  const range = rangeOf(period, anchor);
  const monthR = rangeOf("month", anchor); // balansın ayı
  const data = useFuelData(range.from, range.to, today, monthR.from, monthR.to);
  const [open, setOpen] = useState<number | null>(null);
  const [paysOpen, setPaysOpen] = useState<number | null>(null); // "Verilən pullar" siyahısı ayrıca açılan bölmədir (bağlı başlayır)
  const [picked, setPicked] = useState<number | null>(null); // başlıqda göstərilən usta (kartına klik)
  const [paying, setPaying] = useState<PayTarget | null>(null);

  const shift = (dir: 1 | -1) => setAnchor((a) => {
    const next = period === "day" ? addDays(a, dir) : period === "week" ? addDays(a, 7 * dir) : addMonths(a, dir);
    return next > today ? today : next;
  });
  const cars = useMemo(() => buildCars(data), [data]);
  const sel = cars.find((c) => c.car.id === picked) ?? cars[0] ?? null;

  return {
    today, period, range, monthR, data, cars, sel, open, paysOpen, paying, shift,
    atEnd: range.to >= today,
    choosePeriod: (p: Period) => { setPeriod(p); setAnchor(today); },
    pick: setPicked,
    toggle: (id: number) => { setPicked(id); setOpen(open === id ? null : id); },
    togglePays: (id: number) => setPaysOpen(paysOpen === id ? null : id),
    pay: (c: CarSummary) => setPaying({ id: c.car.id, name: c.car.full_name, suggest: -c.balance }),
    closePay: () => setPaying(null),
  };
}
