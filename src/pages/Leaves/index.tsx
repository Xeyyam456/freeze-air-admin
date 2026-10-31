import { Page } from "@/components/Page";
import { HistorySection } from "./components/HistorySection";
import { LeavesSummary } from "./components/LeavesSummary";
import { PendingSection } from "./components/PendingSection";
import { SoonSection } from "./components/SoonSection";
import { useLeaveActions } from "./queries/useLeaveActions";
import { useLeavesPage } from "./hooks/useLeavesPage";
import { Card } from "@/shared/components/Card";

// İcazələr (migrasiya 0059): usta usta panelindən icazə istəyir ("İcazələrim"), admin/rəhbərlik burada təsdiqləyir və ya rədd edir; köhnələri silir (0067).
// Düzülüş (2026-10-23): tünd xülasə → gözləyən sorğular (iri kartlar, ustanın bu ilki icazə günü ilə) → bu gün və qarşıdakı icazələr →
// süzgəcli tarixçə (vəziyyət + usta, aylara görə). Təsdiqlənən günlər davamiyyətdə "İcazəli" sayılır. Yeni sorğu Realtime ilə gəlir.
export default function LeavesPage() {
  const p = useLeavesPage();
  const { decide, remove } = useLeaveActions();

  return (
    <Page title="İcazələr" subtitle="Ustaların icazə sorğuları: təsdiqlə və ya rədd et">
      {!p.loaded ? (
        <Card className="muted py-12 text-center text-sm">Yüklənir...</Card>
      ) : (
        <div className="space-y-6">
          <LeavesSummary view={p.view} />
          <PendingSection items={p.view.pending} yearDays={p.view.yearDays} onDecide={decide} />
          {(p.view.now.length > 0 || p.view.upcoming.length > 0) && <SoonSection now={p.view.now} upcoming={p.view.upcoming} />}
          <HistorySection people={p.view.people} filter={p.filter} who={p.who} counts={p.counts} total={p.view.history.length}
            byMonth={p.byMonth} closed={p.closed} onFilter={p.setFilter} onWho={p.setWho} onRemove={remove} />
        </div>
      )}
    </Page>
  );
}
