import { useState } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { Page } from "@/components/Page";
import { WorkLogModal } from "@/components/work/WorkLogModal";
import { AllLogsModal } from "./components/AllLogsModal";
import { PanelDashboard } from "./components/Dashboard";
import { longDate } from "./utils/dateText";

// Admin paneli (ana səhifə): tünd dashboard — ayın işləri, tapşırıqlar, işdə olanlar, son işlər, depo
export default function Home() {
  const { name } = useAuth();
  const [openLog, setOpenLog] = useState<number | null>(null);
  const [allLogs, setAllLogs] = useState<string | null>(null); // null = bağlı; "" = hamısı; ad = ustanın işləri
  const firstName = name?.trim().split(/\s+/).pop();

  return (
    <Page title={firstName ? `Salam, ${firstName}` : "Xoş gəldin"} subtitle={longDate()}>
      {openLog && <WorkLogModal logId={openLog} onClose={() => setOpenLog(null)} />}
      {allLogs !== null && <AllLogsModal initialQuery={allLogs} onClose={() => setAllLogs(null)} />}

      <PanelDashboard onOpenLog={setOpenLog} onAllLogs={setAllLogs} />
    </Page>
  );
}
