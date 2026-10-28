import type { MileageRow } from "@/types/fuel";

export const azn = (n: number) => `${n.toFixed(2)} ₼`;
// Balansın rəngi (tünd başlıqda): borc, artıq, bərabər
export const BAL_CLS = { debt: "text-[#fb7185]", over: "text-amber-300", even: "text-[#4ade80]" } as const;

// Bağlanmış günlərin cəmi: km, litr, məbləğ, gün sayı
export const sum = (rows: MileageRow[]) => {
  const closed = rows.filter((r) => r.km !== null);
  return {
    km: closed.reduce((n, r) => n + (r.km ?? 0), 0),
    liters: closed.reduce((n, r) => n + Number(r.liters ?? 0), 0),
    cost: closed.reduce((n, r) => n + Number(r.cost ?? 0), 0),
    days: closed.length,
  };
};
