import { useState } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { Page } from "@/components/Page";
import { WorkLogModal } from "@/components/work/WorkLogModal";
import { AllLogsModal } from "./components/AllLogsModal";
import { LogsCard } from "./components/LogsCard";
import { LowStockBanner } from "./components/LowStockBanner";
import { MastersCard } from "./components/MastersCard";
import { MonthDashboard } from "./components/MonthDashboard";
import { QuickLinks } from "./components/QuickLinks";
import { StatsRow } from "./components/StatsRow";
import { useDashboardData } from "./queries/useDashboardData";
import { longDate } from "./utils/dateText";

// Admin paneli (ana səhifə): göstəricilər, depoda azalanlar, bugünkü işlər, ayın icmalı, ustalar, sürətli keçidlər
export default function Home() {
  const { name } = useAuth();
  const d = useDashboardData();
  const [openLog, setOpenLog] = useState<number | null>(null);
  const [allLogs, setAllLogs] = useState<string | null>(null); // null = bağlı; "" = hamısı; ad = ustanın işləri
  const firstName = name?.trim().split(/\s+/).pop();

  return (
    <Page title={firstName ? `Salam, ${firstName}` : "Xoş gəldin"} subtitle={longDate()}>
      {openLog && <WorkLogModal logId={openLog} onClose={() => setOpenLog(null)} />}
      {allLogs !== null && <AllLogsModal initialQuery={allLogs} onClose={() => setAllLogs(null)} />}

      <StatsRow d={d} />
      <LowStockBanner items={d?.lowStock ?? []} />

      <div className="mt-5">
        <LogsCard d={d} onOpen={setOpenLog} onAll={() => setAllLogs("")} />
      </div>

      {/* Ayın icmalı: iş qeydləri ilə ustalar arasında (bütün ustaların ay üzrə gördüyü işlər) */}
      <div className="mt-5">
        <MonthDashboard onUsta={(n) => setAllLogs(n)} />
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[1.7fr_1fr]">
        <MastersCard d={d} onOpenLogs={setAllLogs} />
        <QuickLinks />
      </div>
    </Page>
  );
}
