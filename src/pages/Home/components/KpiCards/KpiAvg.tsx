import { Activity } from "lucide-react";
import type { KpiProps } from "@/types/dashboard";
import { CountUp } from "@/components/CountUp";
import { BarSpark } from "../BarSpark";
import { DashCard } from "../DashCard";
import { KpiHead } from "./KpiHead";
import s from "./KpiCards.module.css";

// Gündəlik orta iş (bu ay, iş günlərinə görə) + son 10 günün sütunları
export function KpiAvg({ v }: KpiProps) {
  return (
    <DashCard tone="green">
      <KpiHead icon={Activity} delta={v.avgDelta} />
      <div className={s.value}><b><CountUp value={v.avg} decimals={1} duration={1400} /></b></div>
      <p className={s.label}>Gündəlik orta iş</p>
      <BarSpark bars={v.bars} />
    </DashCard>
  );
}
