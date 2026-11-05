import { useState } from "react";
import type { AreaChartProps } from "@/types/dashboard";
import { useWidth } from "../../hooks/useWidth";
import { niceTicks } from "../../utils/niceTicks";
import { smoothPath } from "../../utils/smoothPath";
import { ChartPeak } from "./ChartPeak";
import s from "./AreaChart.module.css";

const PAD = { l: 34, r: 8, t: 30, b: 24 }; // yuxarıda ən yüksək nöqtənin nişanına yer

// Sahə qrafiki (bir seriya): 2px xətt, altında solğun dolğu, 4 yumşaq şəbəkə xətti.
// Açılanda (və dövr dəyişəndə) soldan sağa çəkilir, sonuncu nöqtə (bu gün) sakit "nəbz" vurur;
// üstünə gələndə şaquli xətt + nöqtə + ipucu nöqtədən nöqtəyə sürüşür (tullanmır).
export function AreaChart({ values, labels, color, unit, height = 210 }: AreaChartProps) {
  const { ref, width } = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const ticks = niceTicks(Math.max(1, ...values));
  const top = ticks[ticks.length - 1];
  const w = Math.max(0, width - PAD.l - PAD.r);
  const h = height - PAD.t - PAD.b;
  const x = (i: number) => PAD.l + (values.length > 1 ? (i / (values.length - 1)) * w : w / 2);
  const y = (v: number) => PAD.t + h - (v / top) * h;
  const line = smoothPath(values.map((v, i) => [x(i), y(v)]));
  const area = values.length ? `${line} L${x(values.length - 1)},${PAD.t + h} L${x(0)},${PAD.t + h} Z` : "";
  const every = Math.max(1, Math.ceil(values.length / (width < 420 ? 4 : 6))); // dar ekranda tarixlər seyrək: yapışmasın
  const id = `area-${color.replace(/\W/g, "")}`;
  const last = values.length - 1;
  const peak = values.indexOf(Math.max(...values));

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const px = e.clientX - e.currentTarget.getBoundingClientRect().left;
    const i = Math.round(((px - PAD.l) / Math.max(1, w)) * (values.length - 1));
    setHover(Math.min(values.length - 1, Math.max(0, i)));
  };

  return (
    <div ref={ref} className={s.root} style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} onPointerMove={onMove} onPointerLeave={() => setHover(null)} role="img"
          aria-label={values.map((v, i) => `${labels[i]}: ${v} ${unit}`).join(", ")}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.32" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
            <filter id={`${id}-glow`} x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="5" /></filter>
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.l} x2={PAD.l + w} y1={y(t)} y2={y(t)} className={s.grid} />
              <text x={PAD.l - 8} y={y(t) + 4} className={s.yLabel}>{t}</text>
            </g>
          ))}
          {labels.map((l, i) => (i % every === 0 || i === labels.length - 1) && <text key={i} x={x(i)} y={height - 6} className={s.xLabel}>{l}</text>)}
          <g key={values.length} className={s.reveal}>
            <path d={area} fill={`url(#${id})`} className={s.area} />
            <path d={line} className={s.glowLine} stroke={color} filter={`url(#${id}-glow)`} />
            <path d={line} className={s.line} stroke={color} />
            <path d={line} pathLength={1000} className={s.streak} />
          </g>
          {values[peak] > 0 && <ChartPeak key={`peak-${values.length}`} x={x(peak)} y={y(values[peak])} value={values[peak]} color={color} />}
          {last >= 0 && (
            <g key={`live-${values.length}`} transform={`translate(${x(last)},${y(values[last])})`} className={hover !== null ? s.liveDim : undefined}>
              <circle r={4} fill={color} className={s.pulse} />
              <circle r={3.5} fill={color} className={s.end} />
            </g>
          )}
          {hover !== null && (
            <g className={s.cursor} style={{ transform: `translateX(${x(hover)}px)` }}>
              <line x1={0} x2={0} y1={PAD.t} y2={PAD.t + h} className={s.cross} />
              <circle r={5} fill={color} className={s.dot} style={{ transform: `translateY(${y(values[hover])}px)` }} />
            </g>
          )}
        </svg>
      )}
      {hover !== null && (
        <div className={s.tip} style={{ left: Math.min(Math.max(x(hover), 60), width - 60), top: y(values[hover]) - 12 }}>
          <b>{values[hover]} {unit}</b>
          <span>{labels[hover]}</span>
        </div>
      )}
    </div>
  );
}
