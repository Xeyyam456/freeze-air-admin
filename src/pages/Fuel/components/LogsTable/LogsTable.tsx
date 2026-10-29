import { MoonStar, SunMedium } from "lucide-react";
import type { LogsTableProps } from "@/types/fuel";
import { azn } from "../../shared/money";
import { LogRow } from "../LogRow";

// Dövrün günləri: səhər/axşam km + şəkil, məbləğ, həmin gün verilən pul; mobildə gün kartları
export function LogsTable({ logs, payments, total, paid, range, today }: LogsTableProps) {
  if (logs.length === 0) return <p className="muted border-t border-line px-5 py-4 text-sm">Bu dövrdə yürüş yazılmayıb.</p>;
  return (
    <div className="overflow-x-auto border-t border-line">
      <table className="w-full text-sm max-sm:block md:min-w-[720px]">
        <thead className="bg-bg text-left text-xs text-muted max-sm:hidden">
          <tr>
            <th className="px-5 max-md:px-3 py-2 font-semibold">Gün</th>
            <th className="px-3 max-md:px-2 py-2 font-semibold"><span className="flex items-center gap-1.5"><span className="grid h-6 w-6 place-items-center rounded-lg bg-emerald-100 text-emerald-600"><SunMedium size={15} strokeWidth={2.2} /></span> Səhər</span></th>
            <th className="px-3 max-md:px-2 py-2 font-semibold"><span className="flex items-center gap-1.5"><span className="grid h-6 w-6 place-items-center rounded-lg bg-violet-100 text-violet-600"><MoonStar size={15} strokeWidth={2.2} /></span> Axşam</span></th>
            <th className="max-md:hidden px-3 max-md:px-2 py-2 text-right font-semibold">Km</th>
            <th className="px-3 max-md:px-2 py-2 text-right font-semibold">Məbləğ</th>
            <th className="px-5 max-md:px-3 py-2 text-right font-semibold">Verildi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line max-sm:block">
          {logs.map((l) => <LogRow key={l.id} l={l} payments={payments} today={today} />)}
        </tbody>
        <tfoot className="bg-bg font-bold max-sm:block">
          <tr className="max-sm:grid max-sm:grid-cols-2 max-sm:gap-y-1 max-sm:px-3.5 max-sm:py-2.5">
            <td className="px-5 max-md:px-3 py-2 max-sm:col-span-2 max-sm:!p-0" colSpan={3}>Cəmi · {range.label} ({total.days} / {range.workdays} iş günü)</td>
            <td className="max-md:hidden px-3 max-md:px-2 py-2 text-right tabular-nums">{total.km}</td>
            <td className="whitespace-nowrap px-3 max-md:px-2 py-2 text-right tabular-nums max-sm:block max-sm:!p-0 max-sm:text-left">{azn(total.cost)}</td>
            <td className="px-5 max-md:px-3 py-2 text-right tabular-nums max-sm:block max-sm:!p-0">{azn(paid)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
