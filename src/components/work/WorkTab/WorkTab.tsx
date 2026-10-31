import { useState } from "react";
import { formatDateAz } from "@/shared/utils/formatDateAz";
import type { EmployeeLog, WorkTabProps } from "@/types/workLogs";
import { WorkLogForm } from "../WorkLogForm";
import { WorkLogModal } from "../WorkLogModal";
import { DayNav } from "./components/DayNav";
import { LogCard } from "./components/LogCard";
import { placeLabel } from "./utils/placeLabel";
import { useWorkTab } from "./hooks/useWorkTab";
import { VideoModal } from "./components/VideoModal";

// Ustanın kartında "İşlər" tabı: günə görə işlər; usta özü əlavə edir və redaktə edir, admin görür və silir
export function WorkTab({ employeeId, employeeName, admin }: WorkTabProps) {
  const t = useWorkTab(employeeId);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<EmployeeLog | null>(null);
  const [playing, setPlaying] = useState<string | null>(null); // açılmış videonun linki (pəncərədə oynayır)
  const [openLog, setOpenLog] = useState<number | null>(null); // qrupun faylları: iş pəncərəsi

  return (
    <div className="flex h-full flex-col gap-2">
      {openLog && <WorkLogModal key={openLog} logId={openLog} onClose={() => setOpenLog(null)} />}
      {playing && <VideoModal url={playing} onClose={() => setPlaying(null)} />}
      {adding && <WorkLogForm employeeId={employeeId} employeeName={employeeName} onClose={() => setAdding(false)} onSaved={t.load} />}
      {editing && (
        <WorkLogForm
          employeeId={employeeId}
          employeeName={employeeName}
          existing={{
            id: editing.id,
            work_date: editing.work_date,
            description: editing.description,
            place: {
              key: "current", storeId: editing.store_id, companyId: editing.company_id, custom: editing.place_text,
              group: "", label: placeLabel(editing), sub: editing.place_text ? "Siyahıda olmayan yer" : "", search: "",
            },
            files: editing.work_files,
          }}
          onClose={() => setEditing(null)}
          onSaved={t.load}
        />
      )}

      <DayNav day={t.day} today={t.today} yesterday={t.yesterday} canAdd={t.canAdd} onDay={t.changeDay} onAdd={() => setAdding(true)} />

      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {t.logs === null ? (
          <p className="muted py-6 text-center text-sm">Yüklənir...</p>
        ) : t.logs.length === 0 ? (
          <div className="grid h-full place-items-center rounded-xl border border-dashed border-line">
            <p className="muted text-sm">{t.day === t.today ? "Bu gün" : t.day === t.yesterday ? "Dünən" : `${formatDateAz(t.day)} tarixində`} iş qeydi yoxdur.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {t.logs.map((log) => (
              <LogCard key={log.id} log={log} canDelete={admin || t.isMine(log)} canEdit={t.isMine(log)}
                onEdit={() => setEditing(log)} onDelete={() => t.remove(log)} onOpenGroup={() => setOpenLog(log.id)} onPlay={setPlaying} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
