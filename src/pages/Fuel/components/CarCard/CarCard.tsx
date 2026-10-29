import type { CarCardProps } from "@/types/fuel";
import { CarRow } from "../CarRow";
import { LogsTable } from "../LogsTable";
import { PaymentsList } from "../PaymentsList";

// Maşın kartı: xülasə sətri; açılanda verilən pullar və günlərin cədvəli
export function CarCard({ item, selected, expanded, paysOpen, period, range, today, onPick, onToggle, onTogglePays }: CarCardProps) {
  const { logs, total, payments, paid } = item;
  return (
    <li className={`card overflow-hidden !p-0 transition-shadow ${selected ? "!border-primary ring-2 ring-primary-soft" : ""}`}>
      <CarRow item={item} period={period} range={range} expanded={expanded} onPick={onPick} onToggle={onToggle} />
      {expanded && payments.length > 0 && <PaymentsList payments={payments} paid={paid} open={paysOpen} onToggle={onTogglePays} />}
      {expanded && <LogsTable logs={logs} payments={payments} total={total} paid={paid} range={range} today={today} />}
    </li>
  );
}
