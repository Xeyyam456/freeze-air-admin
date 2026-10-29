import type { ChartHoverProps } from "@/types/dashboard";
import { MONTHS, WEEKDAYS } from "../../utils/chart";

// Hover qatı: hər gün üçün sütun (hit sahəsi gün enində), şaquli xətt və tooltip
export function ChartHover({ y, m, series, values, shown, top, cumulative, hover, onHover }: ChartHoverProps) {
  const days = series.length;
  const yOf = (v: number) => 100 - (v / top) * 100;
  return (
    <div className="absolute inset-0 flex">
      {Array.from({ length: days }, (_, i) => {
        const day = i + 1;
        const disabled = i >= shown;
        const wd = WEEKDAYS[new Date(y, m, day).getDay()];
        const align = i < days / 3 ? "left-0" : i > (days * 2) / 3 ? "right-0" : "left-1/2 -translate-x-1/2";
        return (
          <div key={day} tabIndex={disabled ? -1 : 0} onMouseEnter={() => !disabled && onHover(i)} onFocus={() => !disabled && onHover(i)} onBlur={() => onHover(null)}
            aria-label={disabled ? undefined : `${day} ${MONTHS[m].toLowerCase()}, ${wd}: ${series[i]} iş`}
            className="relative h-full flex-1 outline-none">
            {hover === i && !disabled && (
              <>
                <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-white/50 to-white/5" />
                <span className="pointer-events-none absolute left-1/2 grid h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-frost shadow-[0_0_14px_rgba(45,212,191,0.95)] ring-[3px] ring-[#11243a]"
                  style={{ top: `${yOf(values[i])}%` }} />
                <div role="tooltip" style={{ bottom: `calc(${(values[i] / top) * 100}% + 20px)` }}
                  className={`pointer-events-none absolute z-10 whitespace-nowrap rounded-xl border border-white/15 bg-[#0b1324]/95 px-3 py-2 text-xs text-white shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur ${align}`}>
                  <p className="text-sm font-bold">{series[i]} iş{cumulative && <span className="font-medium text-white/60"> · yığım {values[i]}</span>}</p>
                  <p className="text-white/60">{day} {MONTHS[m].toLowerCase()}, {wd}</p>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
