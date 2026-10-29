import { useState } from "react";
import { X } from "lucide-react";
import { useData } from "@/lib/useData";
import { fetchLogDetail } from "@/services/workLogs/fetchLogDetail";
import { Modal } from "@/shared/components/Modal";
import type { ViewingFile, WorkLogModalProps } from "@/types/workLogs";
import { FileViewer } from "./FileViewer";
import { LogFiles } from "./LogFiles";
import { LogMaterials } from "./LogMaterials";
import { LogPlaceCard } from "./LogPlaceCard";
import { LogWhat } from "./LogWhat";
import { LogWho } from "./LogWho";

// İş qeydinin ətraflı pəncərəsi: kim, harada, nə vaxt (iş günü + əlavə olunma saatı), nə edib, akt və şəkillər
export function WorkLogModal({ logId, onClose }: WorkLogModalProps) {
  const log = useData("work-log", () => fetchLogDetail(logId), [logId]);
  // Akt, şəkillər və video yeni səhifədə yox, pəncərədə açılır
  const [viewing, setViewing] = useState<ViewingFile | null>(null);

  return (
    <Modal onClose={onClose} labelledBy="work-log-title" className="!max-w-2xl">
      <div className="mb-5 flex items-start justify-between gap-3">
        <h2 id="work-log-title" className="text-lg font-bold">İş qeydi</h2>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>

      {log === null ? (
        <p className="muted grid min-h-[300px] place-items-center text-sm">Yüklənir...</p>
      ) : log === undefined ? (
        <p className="muted py-8 text-center text-sm">İş qeydi tapılmadı (silinmiş ola bilər).</p>
      ) : (
        <div className="space-y-4">
          <LogWho log={log} />
          <LogPlaceCard log={log} />
          <LogWhat log={log} />
          <LogMaterials log={log} />
          <LogFiles log={log} onView={setViewing} />
        </div>
      )}
      {viewing && <FileViewer file={viewing} onClose={() => setViewing(null)} />}
    </Modal>
  );
}
