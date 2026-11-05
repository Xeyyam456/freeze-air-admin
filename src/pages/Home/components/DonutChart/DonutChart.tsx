import type { DonutChartProps } from "@/types/dashboard";
import s from "./DonutChart.module.css";

const COLORS = ["var(--s1)", "var(--s2)", "var(--s3)", "var(--s-other)"]; // sabit sıra: şirkətin yeri dəyişsə rəngi də dəyişir
const R = 34;
const C = 2 * Math.PI * R;
const SWEEP = 1000; // bütün dairənin dolma müddəti (ms)
// Dolma bir ease-out (kub) əyrisi ilə gedir: f payına nə vaxt çatılır → seqmentin başlama və bitmə anı (dairə bir hərəkətlə dolur)
const at = (f: number) => SWEEP * (1 - Math.cbrt(1 - Math.min(1, f)));

// Donut + əfsanə (ad və say yanaşı: rəng tək məna daşımır). Seqmentlər arasında 2px boşluq.
export function DonutChart({ shares }: DonutChartProps) {
  const total = shares.reduce((a, b) => a + b.value, 0);
  let offset = 0;
  return (
    <div className={s.root}>
      <svg viewBox="0 0 80 80" className={s.ring} role="img" aria-label={shares.map((x) => `${x.label}: ${x.value}`).join(", ")}>
        <circle cx="40" cy="40" r={R} className={s.track} />
        {total > 0 && shares.map((x, i) => {
          const len = (x.value / total) * C;
          const start = at(offset / C);
          const motion = { "--c": C, "--d": `${start}ms`, "--t": `${Math.max(1, at((offset + len) / C) - start)}ms` } as React.CSSProperties;
          const seg = (
            <circle key={x.label} cx="40" cy="40" r={R} className={s.seg} stroke={COLORS[i]} style={motion}
              strokeDasharray={`${Math.max(0, len - (shares.length > 1 ? 2 : 0))} ${C}`} strokeDashoffset={-offset}>
              <title>{`${x.label}: ${x.value}`}</title>
            </circle>
          );
          offset += len;
          return seg;
        })}
      </svg>
      <ul className={s.legend}>
        {shares.length === 0 && <li className={s.none}>Bu ay hələ iş yoxdur</li>}
        {shares.map((x, i) => (
          <li key={x.label} style={{ "--i": i } as React.CSSProperties}>
            <i style={{ background: COLORS[i] }} />
            <span>{x.label}</span>
            <b>{x.value}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
