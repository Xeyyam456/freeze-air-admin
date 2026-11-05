import type { BarSparkProps } from "@/types/dashboard";
import s from "./BarSpark.module.css";

const DAYS = ["B", "B.e", "Ç.a", "Ç", "C.a", "C", "Ş"];

// Son günlərin sütunları: hündürlük = iş sayı, sonuncu bu gündür; üstünə gələndə gün və say
export function BarSpark({ bars }: BarSparkProps) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  return (
    <div className={s.root} role="img" aria-label={bars.map((b) => `${b.day}: ${b.value}`).join(", ")}>
      {bars.map((b, i) => (
        <span key={b.day} className={s.col} data-tip={`${b.day.slice(8)}.${b.day.slice(5, 7)} · ${b.value} iş`}>
          <span className={`${s.bar} ${i === bars.length - 1 ? s.today : ""}`} style={{ height: `${Math.max(4, (b.value / max) * 100)}%` }} />
          <small>{DAYS[new Date(`${b.day}T12:00:00Z`).getUTCDay()]}</small>
        </span>
      ))}
    </div>
  );
}
