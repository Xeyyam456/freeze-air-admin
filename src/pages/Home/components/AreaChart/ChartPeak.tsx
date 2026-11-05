import type { ChartPeakProps } from "@/types/dashboard";
import s from "./AreaChart.module.css";

// Ən yüksək nöqtənin üstündə dəyər yazılmış kiçik nişan (xətt çəkilib qurtaranda açılır)
export function ChartPeak({ x, y, value, color }: ChartPeakProps) {
  const text = String(value);
  const w = 14 + text.length * 7;
  return (
    <g transform={`translate(${x},${y})`} className={s.peak} aria-hidden="true">
      <circle r={3.5} fill={color} className={s.peakDot} />
      <g>
        <rect x={-w / 2} y={-31} width={w} height={18} rx={9} fill={color} className={s.peakPill} />
        <text y={-18.5} className={s.peakText}>{text}</text>
      </g>
    </g>
  );
}
