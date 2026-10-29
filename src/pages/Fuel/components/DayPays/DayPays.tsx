import type { DayPaysProps } from "@/types/fuel";
import { azn } from "../../shared/money";
import { PayStatus } from "../PayStatus";

// Cədvəldə "Verildi": həmin gün verilən pullar və ustanın cavabı
export function DayPays({ payments }: DayPaysProps) {
  if (payments.length === 0) return <span className="whitespace-nowrap rounded-full bg-danger-soft px-2 py-0.5 text-[11px] font-bold text-danger">Verilmədi</span>;
  return (
    <span className="inline-flex flex-col items-end gap-0.5">
      {payments.map((p) => <span key={p.id} className="flex items-center gap-1.5"><b className="tabular-nums">{azn(Number(p.amount))}</b><PayStatus p={p} /></span>)}
    </span>
  );
}
