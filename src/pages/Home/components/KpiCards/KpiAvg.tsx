import type { KpiProps } from "@/types/dashboard";
import { BarSpark } from "../BarSpark";
import { CountUp } from "@/components/CountUp";
import { DashCard } from "../DashCard";
import { DeltaBadge } from "../DeltaBadge";
import s from "./KpiCards.module.css";

// Gündəlik orta iş (bu ay, iş günlərinə görə) + son 10 günün sütunları
export function KpiAvg({ v }: KpiProps) {
  return (
    <DashCard>
      <div className={s.value}><b><CountUp value={v.avg} decimals={1} duration={1400} /></b><DeltaBadge value={v.avgDelta} /></div>
      <p className={s.label}>Gündəlik orta iş</p>
      <BarSpark bars={v.bars} />
    </DashCard>
  );
}
