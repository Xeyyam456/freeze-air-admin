import type { CarSummary, FuelData } from "@/types/fuel";
import { sum } from "../shared/money";

// Hər maşın üçün dövrün yürüşləri, cəmi, ödənişləri, ayın balansı və bu günün hesabatı
export function buildCars(data: FuelData | null | undefined): CarSummary[] {
  return (data?.cars ?? []).map((c) => {
    const logs = (data?.logs ?? []).filter((l) => l.employee_id === c.id);
    const payments = (data?.payments ?? []).filter((p) => p.employee_id === c.id);
    const month = data?.month.get(c.id) ?? { cost: 0, paid: 0 };
    return {
      // balance: AYIN balansı (ayda verilən − ayda sərf); gün/həftə seçilsə də ayın borcuna görə
      car: c, logs, total: sum(logs), payments, paid: payments.reduce((n, p) => n + Number(p.amount), 0), month,
      balance: month.paid - month.cost,
      today: (data?.todayLogs ?? []).find((l) => l.employee_id === c.id),
    };
  });
}
