import { CalendarDays, ClipboardList, MapPin, SlidersHorizontal, Users } from "lucide-react";
import { Page } from "@/components/Page";
import { WithSidePanel } from "@/components/SidePanel";
import { WorkLogModal } from "@/components/work/WorkLogModal";
import { LOGS_LIMIT } from "@/services/workLogs/fetchLogs";
import { FiltersPanel } from "./components/FiltersPanel";
import { LogDays } from "./components/LogDays";
import { Summary } from "./components/Summary";
import { useWorkLogsPage } from "./hooks/useWorkLogsPage";
import { range } from "./utils/logs";

// Görülən işlər: tarix aralığı, usta, şirkət və axtarışla süz, günlərə görə siyahı (qrup işi bir açılan sətir), Excel-ə yaz
export default function WorkLogsPage() {
  const p = useWorkLogsPage();
  const { logs } = p;
  return (
    <Page title="Görülən işlər" subtitle="Tarix, usta və yerə görə süz, Excel-ə yaz">
      {p.openLog && <WorkLogModal logId={p.openLog} onClose={() => p.setOpenLog(null)} />}
      <WithSidePanel stack fabLabel="Süzgəc və Excel" fabIcon={SlidersHorizontal} panel={
        <FiltersPanel from={p.from} to={p.to} onFrom={p.setFrom} onTo={p.setTo} onRange={(k) => p.setRange(range(k))} filters={p.filters}
          employeeId={p.employeeId} onEmployee={p.setEmployeeId} companyId={p.companyId} onCompany={p.setCompanyId}
          query={p.query} onQuery={p.setQuery} list={p.list} tooMany={!!logs && logs.length >= LOGS_LIMIT} />
      }>
        <div className="flex h-full flex-col gap-4">
          <div className="grid shrink-0 grid-cols-4 gap-4 max-sm:grid-cols-2 max-sm:gap-2.5">
            <Summary label="İş sayı" value={logs ? p.list.length : "…"} icon={ClipboardList} />
            <Summary label="İş günü" value={logs ? p.stats.days : "…"} icon={CalendarDays} />
            <Summary label="Usta" value={logs ? p.stats.masters : "…"} icon={Users} />
            <Summary label="Fərqli yer" value={logs ? p.stats.places : "…"} icon={MapPin} />
          </div>
          <LogDays days={logs === null ? null : p.days} filesOf={p.filesOf} openCrews={p.openCrews} onToggleCrew={p.toggleCrew} onOpen={p.setOpenLog} />
        </div>
      </WithSidePanel>
    </Page>
  );
}
