import type { FlowAxisProps } from "@/types/dashboard";
import s from "./FlowBoard.module.css";

const two = (n: number) => String(Math.floor(n)).padStart(2, "0");

// Saat oxu: iki saatdan bir rəqəm; bu gündürsə "indi" işarəsi dəqiqəsi ilə
export function FlowAxis({ range: [h0, h1], now }: FlowAxisProps) {
  const pos = (h: number) => `${((h - h0) / (h1 - h0)) * 100}%`;
  const ticks = Array.from({ length: h1 - h0 + 1 }, (_, i) => h0 + i).filter((h) => h % 2 === 0);
  return (
    <div className={s.axis} aria-hidden="true">
      {ticks.map((h) => <span key={h} style={{ left: pos(h) }}>{two(h)}</span>)}
      {now !== null && now >= h0 && now <= h1 && (
        <b className={s.nowTag} style={{ left: pos(now) }}>{two(now)}:{two((now % 1) * 60)}</b>
      )}
    </div>
  );
}
