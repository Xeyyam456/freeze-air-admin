import type { KpiProps } from "@/types/dashboard";
import { DashCard } from "../DashCard";
import { DeltaBadge } from "../DeltaBadge";
import { DonutChart } from "../DonutChart";
import s from "./KpiCards.module.css";

// Bu ay görülən işlər + keçən ayın eyni dövrünə nisbətən; şirkətlər üzrə pay
export function KpiMonth({ v }: KpiProps) {
  return (
    <DashCard>
      <div className={s.value}><b>{v.monthTotal}</b><DeltaBadge value={v.monthDelta} /></div>
      <p className={s.label}>Bu ay görülən iş</p>
      <DonutChart shares={v.shares} />
    </DashCard>
  );
}
