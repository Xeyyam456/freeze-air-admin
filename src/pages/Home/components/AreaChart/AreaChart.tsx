import { useState } from "react";
import type { AreaChartProps } from "@/types/dashboard";
import { useWidth } from "../../hooks/useWidth";
import { niceTicks } from "../../utils/niceTicks";
import { smoothPath } from "../../utils/smoothPath";
import s from "./AreaChart.module.css";

const PAD = { l: 34, r: 8, t: 10, b: 24 };

// Sahə qrafiki (bir seriya): 2px xətt, altında solğun dolğu, 4 yumşaq şəbəkə xətti; üstünə gələndə şaquli xətt + ipucu
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
  const every = Math.max(1, Math.ceil(values.length / 6));
  const id = `area-${color.replace(/\W/g, "")}`;

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
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.l} x2={PAD.l + w} y1={y(t)} y2={y(t)} className={s.grid} />
              <text x={PAD.l - 8} y={y(t) + 4} className={s.yLabel}>{t}</text>
            </g>
          ))}
          {labels.map((l, i) => (i % every === 0 || i === labels.length - 1) && <text key={i} x={x(i)} y={height - 6} className={s.xLabel}>{l}</text>)}
          <path d={area} fill={`url(#${id})`} />
          <path d={line} className={s.line} stroke={color} />
          {hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={PAD.t + h} className={s.cross} />
              <circle cx={x(hover)} cy={y(values[hover])} r={5} fill={color} className={s.dot} />
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
