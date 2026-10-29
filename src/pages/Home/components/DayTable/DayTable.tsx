import type { DayTableProps } from "@/types/dashboard";
import { MONTHS, WEEKDAYS } from "../../utils/chart";

// Cədvəl görünüşü: iş olan günlər və cəmi
export function DayTable({ y, m, s }: DayTableProps) {
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-xs font-semibold text-white/50"><tr><th className="py-2">Gün</th><th className="py-2 text-right">İş sayı</th></tr></thead>
      <tbody>
        {s.counts.map((c, i) => c > 0 && (
          <tr key={i} className="border-t border-white/10">
            <td className="py-2">{i + 1} {MONTHS[m].toLowerCase()}, {WEEKDAYS[new Date(y, m, i + 1).getDay()]}</td>
            <td className="py-2 text-right font-semibold tabular-nums">{c}</td>
          </tr>
        ))}
        <tr className="border-t border-white/10 font-bold"><td className="py-2">Cəmi</td><td className="py-2 text-right tabular-nums">{s.total}</td></tr>
      </tbody>
    </table>
  );
}
