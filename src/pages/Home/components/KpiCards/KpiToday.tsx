import { CalendarCheck } from "lucide-react";
import type { KpiProps } from "@/types/dashboard";
import { CountUp } from "@/components/CountUp";
import { BarSpark } from "../BarSpark";
import { DashCard } from "../DashCard";
import { KpiHead } from "./KpiHead";
import s from "./KpiCards.module.css";

// Bu gün görülən işlər (dünənlə müqayisə) + son 10 günün sütunları
export function KpiToday({ v }: KpiProps) {
  return (
    <DashCard tone="green">
      <KpiHead icon={CalendarCheck} delta={v.todayDelta} />
      <div className={s.value}><b><CountUp value={v.today} duration={1400} /></b></div>
      <p className={s.label}>Bu gün görülən iş</p>
      <BarSpark bars={v.bars} />
    </DashCard>
  );
}
