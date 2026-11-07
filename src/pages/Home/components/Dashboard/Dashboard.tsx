import { PushPrompt } from "@/components/PushPrompt";
import type { PanelDashboardProps } from "@/types/dashboard";
import { todayBaku } from "@/shared/utils/todayBaku";
import { usePanel } from "../../hooks/usePanel";
import { useDashboardData } from "../../queries/useDashboardData";
import { ChartCard } from "../ChartCard";
import { KpiToday, KpiDuty, KpiMonth, KpiTasks } from "../KpiCards";
import { LowStockBanner } from "../LowStockBanner";
import { RecentWork } from "../RecentWork";
import { SkeletonCard } from "../SkeletonCard";
import s from "./Dashboard.module.css";

// Panel: yuxarıda 4 göstərici + görülən işlər qrafiki, altında son işlər və depo hərəkətləri (tünd dashboard)
export function PanelDashboard({ onOpenLog, onAllLogs }: PanelDashboardProps) {
  const d = useDashboardData();
  const v = usePanel();
  const today = todayBaku();

  if (!v) return (
    <div className={`${s.dash} ${s.skeleton}`} aria-busy="true" aria-label="Panel yüklənir">
      <div className={s.top}>
        {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} kind="kpi" />)}
        <SkeletonCard kind="chart" className={s.big} />
      </div>
      <div className={s.bottom}><SkeletonCard kind="list" /><SkeletonCard kind="chart" /></div>
    </div>
  );
  return (
    <div className={s.dash}>
      <div className={s.notice}><PushPrompt /></div>
      <div className={s.stockMobile}><LowStockBanner items={d?.lowStock ?? []} /></div>
      <div className={s.top}>
        <KpiMonth v={v} d={d} />
        <KpiToday v={v} d={d} />
        <KpiTasks v={v} d={d} />
        <KpiDuty v={v} d={d} />
        <ChartCard title="Görülən işlər" noun="görülən iş" note="Bütün ustalar, qrup işi bir dəfə sayılır" values={v.work30} days={v.days30}
          color="#1fb57f" tone="green" href="/isler" hrefLabel="Görülən işlərə keç" chartHeight={290} className={s.big} />
      </div>
      <div className={s.bottom}>
        <RecentWork rows={v.recent} today={today} onOpen={onOpenLog} onAll={() => onAllLogs("")} />
        <ChartCard title="Depo hərəkətləri" noun="depo hərəkəti" note="Mədaxil, vermə, qaytarma, işlətmə, silmə" values={v.moves30} days={v.days30}
          color="#3987e5" tone="blue" href="/depo" hrefLabel="Depoya keç" />
      </div>
    </div>
  );
}
