import { Wrench } from "lucide-react";
import type { KpiProps } from "@/types/dashboard";
import { CountUp } from "@/components/CountUp";
import { DashCard } from "../DashCard";
import { DonutChart } from "../DonutChart";
import { KpiHead } from "./KpiHead";
import s from "./KpiCards.module.css";

// Bu ay görülən işlər + keçən ayın eyni dövrünə nisbətən; şirkətlər üzrə pay
export function KpiMonth({ v }: KpiProps) {
  return (
    <DashCard tone="blue">
      <KpiHead icon={Wrench} delta={v.monthDelta} />
      <div className={s.value}><b><CountUp value={v.monthTotal} duration={1400} /></b></div>
      <p className={s.label}>Bu ay görülən iş</p>
      <DonutChart shares={v.shares} />
    </DashCard>
  );
}
