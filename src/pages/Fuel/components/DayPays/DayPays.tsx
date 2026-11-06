import type { DayPaysProps } from "@/types/fuel";
import { azn } from "../../shared/money";
import { PayStatus } from "../PayStatus";

const CHIP = "whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold";

// Cədvəldə "Verildi": həmin gün verilən pullar (+ ustanın cavabı) və günün ödəniş vəziyyəti.
// Vəziyyət ayın pullarının günlərə köhnədən yeniyə paylanmasından gəlir (shared/utils/fuelCover.ts): pul başqa gündə birdən
// verilibsə (06.11-də 45.66 ₼ → 02.11 + 06.11) həmin gün "Ödənilib" görünür, "Verilmədi" yox
export function DayPays({ payments, cover }: DayPaysProps) {
  const due = cover ? cover.cost - cover.covered : 0;
  const state = !cover || cover.cost <= 0.005 ? null : due <= 0.005 ? "paid" : cover.covered > 0.005 ? "partial" : "unpaid";
  const chip = state === "paid" ? <span className={`${CHIP} bg-ok-soft text-ok`} title="Ayın verilən pullarından bu günə düşür">Ödənilib</span>
    : state === "partial" ? <span className={`${CHIP} bg-amber-500/15 text-amber-300`}>{azn(due)} qalıb</span>
    : state === "unpaid" ? <span className={`${CHIP} bg-danger-soft text-danger`}>Verilmədi</span>
    : null;

  if (payments.length === 0) return chip ?? <span className="muted text-xs">—</span>;
  return (
    <span className="inline-flex flex-col items-end gap-0.5">
      {payments.map((p) => <span key={p.id} className="flex items-center gap-1.5"><b className="tabular-nums">{azn(Number(p.amount))}</b><PayStatus p={p} /></span>)}
      {state !== "paid" && chip}
    </span>
  );
}
