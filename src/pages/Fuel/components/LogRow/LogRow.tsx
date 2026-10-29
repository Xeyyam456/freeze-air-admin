import type { LogRowProps } from "@/types/fuel";
import { numDate, timeBaku } from "../../shared/dates";
import { azn } from "../../shared/money";
import { DayPays } from "../DayPays";
import { PhotoLink } from "../PhotoLink";

export function LogRow({ l, payments, today }: LogRowProps) {
  return (
    <tr className={`max-sm:grid max-sm:grid-cols-2 max-sm:gap-x-3 max-sm:gap-y-2.5 max-sm:px-3.5 max-sm:py-3 ${l.day === today ? "bg-primary-soft/40" : ""}`}>
      <td className="px-5 max-md:px-3 py-2 font-semibold max-sm:col-span-2 max-sm:flex max-sm:flex-wrap max-sm:items-baseline max-sm:gap-x-2 max-sm:!p-0"><span className="block whitespace-nowrap text-xs tabular-nums">{numDate(l.day)}</span>{l.day === today && <span className="block text-[11px] leading-tight text-primary">bu gün</span>}<span className="block whitespace-nowrap text-[11px] font-bold leading-tight text-ink md:hidden">{l.km ?? "—"} km</span></td>
      <td className="px-3 max-md:px-2 py-2 max-sm:block max-sm:!p-0">
        <span className="muted mb-1 block text-[10px] font-semibold uppercase tracking-wide sm:hidden">Səhər</span>
        <span className="flex flex-col items-stretch gap-1">
          <span className="flex items-baseline justify-between gap-3 whitespace-nowrap"><span className="flex items-baseline gap-1"><b className="tabular-nums">{l.start_km.toLocaleString("az")}</b><span className="muted text-[11px] font-semibold">km</span></span><span className="muted text-[11px]">{timeBaku(l.start_at)}</span></span>
          <span className="self-start"><PhotoLink path={l.start_photo} label="Səhər" /></span></span>
      </td>
      <td className="px-3 max-md:px-2 py-2 max-sm:block max-sm:!p-0">
        <span className="muted mb-1 block text-[10px] font-semibold uppercase tracking-wide sm:hidden">Axşam</span>
        {l.end_km != null ? (
          <span className="flex flex-col items-stretch gap-1">
            <span className="flex items-baseline justify-between gap-3 whitespace-nowrap"><span className="flex items-baseline gap-1"><b className="tabular-nums">{l.end_km.toLocaleString("az")}</b><span className="muted text-[11px] font-semibold">km</span></span>{l.end_at && <span className="muted text-[11px]">{timeBaku(l.end_at)}</span>}</span>
            <span className="self-start"><PhotoLink path={l.end_photo} label="Axşam" /></span></span>
        ) : <span className="muted text-xs">Yazılmayıb</span>}
      </td>
      <td className="max-md:hidden px-3 max-md:px-2 py-2 text-right font-bold tabular-nums">{l.km ?? "—"}</td>
      <td className="whitespace-nowrap px-3 max-md:px-2 py-2 text-right font-bold tabular-nums max-sm:block max-sm:!p-0 max-sm:text-left"><span className="muted block text-[10px] font-semibold uppercase tracking-wide sm:hidden">Məbləğ</span>{l.cost != null ? azn(Number(l.cost)) : "—"}</td>
      <td className="px-5 max-md:px-3 py-2 text-right max-sm:block max-sm:!p-0">
        <span className="muted block text-[10px] font-semibold uppercase tracking-wide sm:hidden">Verildi</span>
        <DayPays payments={payments.filter((p) => p.day === l.day)} />
      </td>
    </tr>
  );
}
