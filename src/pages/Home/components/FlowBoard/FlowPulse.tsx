import type { FlowPulseProps } from "@/types/dashboard";
import s from "./FlowBoard.module.css";

// Son 14 günün nəbzi: hər gün bir sütun (hündürlük = hadisə sayı), sonuncu seçilmiş gündür
export function FlowPulse({ values, days, label }: FlowPulseProps) {
  const max = Math.max(1, ...values);
  const total = values.reduce((a, b) => a + b, 0);
  return (
    <div className={s.pulse} role="img" aria-label={`${label}: son 14 gündə ${total}`}>
      {values.map((v, i) => (
        <span key={i} className={i === values.length - 1 ? s.pulseToday : ""} title={days[i] ? `${days[i].slice(8)}.${days[i].slice(5, 7)}: ${v}` : undefined}
          style={{ height: v ? `${Math.max(14, (v / max) * 100)}%` : undefined }} />
      ))}
      <b>{total}</b>
    </div>
  );
}
