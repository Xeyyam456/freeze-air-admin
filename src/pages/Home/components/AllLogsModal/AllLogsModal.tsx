import { useState } from "react";
import { ClipboardList, Search, X } from "lucide-react";
import { WorkLogModal } from "@/components/work/WorkLogModal";
import { Modal } from "@/shared/components/Modal";
import type { AllLogsModalProps } from "@/types/dashboard";
import { useAllLogs } from "../../hooks/useAllLogs";
import { AllLogRow } from "../AllLogRow";
import { Input } from "@/shared/components/Input";

// Bütün iş qeydləri: günlərə görə qruplu, axtarışlı; klik → ətraflı pəncərə
export function AllLogsModal({ onClose, initialQuery = "" }: AllLogsModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [openLog, setOpenLog] = useState<number | null>(null);
  const { logs, files, q, list, groups, dayLabel } = useAllLogs(query);

  return (
    <>
      <Modal onClose={onClose} labelledBy="all-logs-title" className="flex !max-w-3xl flex-col !p-0">
        <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-4">
          <div>
            <h2 id="all-logs-title" className="flex items-center gap-2 text-lg font-bold"><ClipboardList size={18} className="text-primary" /> Bütün iş qeydləri</h2>
            <p className="muted text-xs">{logs ? `${list.length} iş${q ? " tapıldı" : ""}` : "Yüklənir..."}</p>
          </div>
          <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
        </div>

        <div className="px-6 pt-4">
          <label className="relative block">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} autoFocus placeholder="Usta, iş yeri və ya görülən iş..."
              className="!pl-10" aria-label="İş qeydi axtar" />
          </label>
        </div>

        <div className="nice-scroll mx-2 mb-2 mt-3 h-[min(560px,62dvh)] overflow-y-auto px-4 pb-2">
          {logs === null ? (
            <p className="muted py-10 text-center text-sm">Yüklənir...</p>
          ) : groups.length === 0 ? (
            <p className="muted py-10 text-center text-sm">{q ? "Heç nə tapılmadı." : "Hələ iş qeydi yoxdur."}</p>
          ) : (
            groups.map((g) => (
              <section key={g.day} className="mb-4">
                <h3 className="sticky top-0 z-10 flex items-center justify-between bg-surface/95 py-2 text-xs font-bold text-muted backdrop-blur">
                  {dayLabel(g.day)} <span className="rounded-full bg-bg px-2 py-0.5">{g.items.length} iş</span>
                </h3>
                <ul className="space-y-1">
                  {g.items.map((l) => <AllLogRow key={l.id} l={l} files={files?.get(l.id)} onOpen={setOpenLog} />)}
                </ul>
              </section>
            ))
          )}
        </div>
      </Modal>
      {openLog && <WorkLogModal logId={openLog} onClose={() => setOpenLog(null)} />}
    </>
  );
}
