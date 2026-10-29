import { useMemo, useState } from "react";
import type { MonthChartProps } from "@/types/dashboard";
import { niceTop, smoothPath } from "../../utils/chart";
import { ChartHover } from "../ChartHover";

// Günlük iş sayı: parlayan əyri + qradiyent sahə; hover/fokusda şaquli xətt, nöqtə və tooltip. Rejim: günlük | yığım.
export function MonthChart({ y, m, series, todayDay, cumulative }: MonthChartProps) {
  const days = series.length;
  const shown = todayDay ?? days; // cari ayda gələcək günlər çəkilmir
  const values = useMemo(() => {
    const raw = series.slice(0, shown);
    if (!cumulative) return raw;
    let acc = 0;
    return raw.map((v) => (acc += v));
  }, [series, shown, cumulative]);
  const max = Math.max(0, ...values);
  const top = niceTop(max * 1.12);
  const step = top <= 4 ? 1 : top / 4;
  const ticks: number[] = [];
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(Math.round(v));
  const xOf = (i: number) => ((i + 0.5) / days) * 100;
  const yOf = (v: number) => 100 - (v / top) * 100;
  const pts = values.map((v, i) => [xOf(i), yOf(v)] as [number, number]);
  const line = smoothPath(pts);
  const area = pts.length > 1 ? `${line} L ${pts[pts.length - 1][0]} 100 L ${pts[0][0]} 100 Z` : "";
  const [hover, setHover] = useState<number | null>(null);
  const peak = cumulative ? values.length - 1 : max > 0 ? values.indexOf(max) : -1;

  return (
    <div className="flex gap-3 pt-3">
      <div className="relative h-56 w-7 shrink-0 text-right text-[11px] tabular-nums text-white/50" aria-hidden="true">
        {ticks.map((v) => <span key={v} className="absolute right-0 -translate-y-1/2" style={{ bottom: `${(v / top) * 100}%` }}>{v}</span>)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="relative h-56" onMouseLeave={() => setHover(null)}>
          {ticks.map((v) => <div key={v} className={`absolute inset-x-0 border-t ${v === 0 ? "border-white/25" : "border-white/[0.08]"}`} style={{ bottom: `${(v / top) * 100}%` }} />)}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
            <defs>
              <linearGradient id="md-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#2dd4bf" stopOpacity="0.38" />
                <stop offset="1" stopColor="#0a7ea4" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {area && <path d={area} fill="url(#md-fill)" />}
            {line && (
              <path d={line} fill="none" stroke="#5fd8f0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"
                style={{ filter: "drop-shadow(0 0 6px rgba(45,212,191,0.65))" }} />
            )}
          </svg>
          {/* Son və ya ən hündür nöqtə: yalnız bir rəqəm (hər nöqtəyə yox) */}
          {peak >= 0 && values[peak] > 0 && hover === null && (
            <span className="pointer-events-none absolute grid h-3 w-3 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-frost shadow-[0_0_12px_rgba(45,212,191,0.9)] ring-[3px] ring-[#11243a]"
              style={{ left: `${xOf(peak)}%`, top: `${yOf(values[peak])}%` }}>
              <span className="absolute -top-6 text-[11px] font-bold tabular-nums text-white">{values[peak]}</span>
            </span>
          )}
          <ChartHover y={y} m={m} series={series} values={values} shown={shown} top={top} cumulative={cumulative} hover={hover} onHover={setHover} />
        </div>
        <div className="mt-1.5 flex" aria-hidden="true">
          {Array.from({ length: days }, (_, i) => (
            <span key={i} className={`flex-1 text-center text-[10px] tabular-nums ${i >= shown ? "text-white/20" : "text-white/50"}`}>{(i + 1) % 2 === 1 || days <= 16 ? i + 1 : ""}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
