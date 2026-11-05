import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowUpRight } from "lucide-react";
import type { ChartCardProps } from "@/types/dashboard";
import { dayLabel } from "../../utils/dayLabel";
import { deltaPct } from "../../utils/deltaPct";
import { AreaChart } from "../AreaChart";
import { CountUp } from "@/components/CountUp";
import { DashCard } from "../DashCard";
import { DeltaBadge } from "../DeltaBadge";
import s from "./ChartCard.module.css";

const RANGES = [7, 14, 30] as const;

// Qrafik kartı: "…" menyusundan dövr (son 7 / 14 / 30 gün) seçilir, rəqəm və qrafik dərhal dəyişir; bölməyə keçid də menyudadır.
// 7 və 14 gündə əvvəlki eyni dövrlə müqayisə faizi göstərilir (30 gün üçün əvvəlki dövr yüklənmir).
export function ChartCard({ title, noun, note, values, days, color, tone, href, hrefLabel, chartHeight, className }: ChartCardProps) {
  const navigate = useNavigate();
  const [range, setRange] = useState<(typeof RANGES)[number]>(30);
  const shown = values.slice(-range);
  const total = shown.reduce((a, b) => a + b, 0);
  const before = range < 30 ? values.slice(-range * 2, -range).reduce((a, b) => a + b, 0) : 0;

  const menu = [
    ...RANGES.map((n) => ({ section: "Dövr", label: `Son ${n} gün`, active: range === n, onSelect: () => setRange(n) })),
    { section: "Keçid", label: hrefLabel, icon: ArrowUpRight, onSelect: () => navigate(href) },
  ];

  return (
    <DashCard title={title} subtitle={`Son ${range} gün`} menu={menu} tone={tone} className={className}>
      <div className={s.value}>
        <b><CountUp value={total} duration={1400} /></b>
        {range < 30 && <DeltaBadge value={deltaPct(total, before)} />}
      </div>
      <p className={s.label}>{note ?? `Son ${range} gündə ${noun}`}</p>
      <div className={s.chart}>
        <AreaChart values={shown} labels={days.slice(-range).map(dayLabel)} color={color} unit={noun} height={chartHeight} />
      </div>
    </DashCard>
  );
}
