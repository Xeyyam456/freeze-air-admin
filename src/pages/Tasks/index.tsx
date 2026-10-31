import { Page } from "@/components/Page";
import { WithSidePanel } from "@/components/SidePanel";
import { WorkLogModal } from "@/components/work/WorkLogModal";
import { AddMemberModal } from "./components/AddMemberModal";
import { DayBar } from "./components/DayBar";
import { EmptyTasks } from "./components/EmptyTasks";
import { SingleTasks } from "./components/SingleTasks";
import { TaskForm } from "./components/TaskForm";
import { TeamTasks } from "./components/TeamTasks";
import { WithdrawGroupModal } from "./components/WithdrawGroupModal";
import { WithdrawModal } from "./components/WithdrawModal";
import { useTasksPage } from "./hooks/useTasksPage";
import { Card } from "@/shared/components/Card";

// Admin və rəhbərlik ustaya gün üçün iş təyin edir (usta, yer, səbəb), lazım olsa geri alır (başqa ustaya verir).
// "Görüldü" işarəsini yalnız usta qoyur (usta panelində): burada qutu yalnız vəziyyəti göstərir. Silmək yoxdur (0057).
export default function TasksPage() {
  const p = useTasksPage();
  const { data } = p;
  return (
    <Page title="Tapşırıqlar" subtitle="Ustalara günün işi: hansı usta, harada, nə üçün">
      {p.adding && data && <AddMemberModal key={p.adding.task.id} task={p.adding.task} members={p.adding.members} employees={data.employees} onClose={p.closeAdd} />}
      {p.openLog && <WorkLogModal logId={p.openLog} onClose={p.closeLog} />}
      {p.withdrawingGroup && data && <WithdrawGroupModal key={p.withdrawingGroup[0].id} rows={p.withdrawingGroup} employees={data.employees} onClose={p.closeWithdrawGroup} />}
      {p.withdrawing && data && <WithdrawModal key={p.withdrawing.id} task={p.withdrawing} employees={data.employees} onClose={p.closeWithdraw} />}
      <WithSidePanel stack fabLabel="Yeni tapşırıq" panel={<TaskForm data={data} day={p.day} today={p.today} onDay={p.setDay} />}>
        <div className="flex h-full flex-col gap-4">
          <DayBar day={p.day} today={p.today} past={p.past} total={p.total} doneCount={p.doneCount} onDay={p.setDay} />
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {data === null ? (
              <Card className="muted py-12 text-center text-sm">Yüklənir...</Card>
            ) : p.groups.length === 0 && p.teams.length === 0 ? <EmptyTasks /> : (
              <>
                {p.crewsView.length > 0 && <TeamTasks crews={p.crewsView} liveCount={p.liveTeams.length} employees={data.employees} actions={p.actions} />}
                {p.groups.length > 0 && <SingleTasks groups={p.groups} showTitle={p.teams.length > 0} count={p.single.length} actions={p.actions} />}
              </>
            )}
          </div>
        </div>
      </WithSidePanel>
    </Page>
  );
}
