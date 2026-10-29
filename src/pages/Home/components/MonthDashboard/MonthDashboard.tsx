import { useState } from "react";
import { useData } from "@/lib/useData";
import { fetchMonth } from "@/services/dashboard/fetchMonth";
import type { MonthData, MonthDashboardProps } from "@/types/dashboard";
import { useMonthStats } from "../../hooks/useMonthStats";
import { DashHeader } from "../DashHeader";
import { DaysPanel } from "../DaysPanel";
import { KpiTiles } from "../KpiTiles";
import { Ranking } from "../Ranking";

// Ayın icmalı (admin): bütün ustaların gördüyü işlər: KPI, günlük əyri, ustalar üzrə reyting. Ustaya klik → onun işləri.
// Tünd navy kart (tətbiqin başlıq zolağı ilə eyni palitra): şüşə xanalar, parlayan əyri.
export function MonthDashboard({ onUsta }: MonthDashboardProps) {
  const [today] = useState(() => {
    const t = new Date();
    return { y: t.getFullYear(), m: t.getMonth(), d: t.getDate() };
  });
  const [ym, setYm] = useState({ y: today.y, m: today.m });
  // Keşdə (useData): Panelə qayıdanda dərhal görünür; ay dəyişəndə köhnə ay yeni gələnə qədər qalır (data.key ilə ayırd edilir)
  const data: MonthData | null = useData("month-dashboard", () => fetchMonth(ym.y, ym.m), [ym.y, ym.m]);
  const [cumulative, setCumulative] = useState(false);
  const isCurrent = ym.y === today.y && ym.m === today.m;
  const s = useMonthStats(data, new Date(ym.y, ym.m + 1, 0).getDate());
  const loading = !data || data.key !== `${ym.y}-${ym.m}`;

  return (
    <section className="relative overflow-clip rounded-[18px] bg-[linear-gradient(135deg,#0b1324,#11243a_55%,#0f3d4c)] text-white shadow-[0_18px_48px_rgba(10,26,51,0.35)] ring-1 ring-white/10">
      {/* Yumşaq işıq ləkələri (dekor) */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#2dd4bf]/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-[#0a7ea4]/25 blur-3xl" aria-hidden="true" />

      <div className="relative">
        <DashHeader y={ym.y} m={ym.m} isCurrent={isCurrent} cumulative={cumulative} onCumulative={setCumulative}
          onPrev={() => setYm((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }))}
          onNext={() => setYm((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }))} />

        {/* Yenilənəndə çərçivə qalır, məzmun solğunlaşır (skelet və tullanma yox) */}
        <div className={`grid gap-6 p-6 transition-opacity max-sm:gap-4 max-sm:p-3 xl:grid-cols-[1.7fr_1fr] ${loading && data ? "opacity-60" : ""}`}>
          {!data ? (
            <p className="text-sm text-white/60 xl:col-span-2">Yüklənir...</p>
          ) : (
            <>
              <div className="min-w-0 space-y-5">
                <KpiTiles s={s} diff={s.total - data.prevCount} />
                <DaysPanel y={ym.y} m={ym.m} s={s} todayDay={isCurrent ? today.d : null} cumulative={cumulative} />
              </div>
              <Ranking ranking={s.ranking} onUsta={onUsta} />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
