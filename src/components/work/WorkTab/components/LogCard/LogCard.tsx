import { Clock, Home, MapPin, Pencil, Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import type { LogCardProps } from "@/types/workLogs";
import { FileBadges } from "../../../FileBadges";
import { LogFileTiles } from "../LogFileTiles";
import { placeLabel } from "../../utils/placeLabel";
import { timeOf } from "@/components/work/WorkLogModal/utils/time";

// İş kartı: yer, əlavə olunma saatı, redaktə/sil, görülən iş, qrupun faylları, akt/şəkil/video
export function LogCard({ log, canDelete, canEdit, onEdit, onDelete, onOpenGroup, onPlay }: LogCardProps) {
  return (
    <li className="rounded-xl border border-line p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-primary">
            {log.place_text ? <Home size={13} className="shrink-0" /> : <MapPin size={13} className="shrink-0" />} {placeLabel(log)}
          </p>
          <p className="muted mt-0.5 flex items-center gap-1 text-[11px]"><Clock size={11} /> Əlavə edilib: {timeOf(log.created_at)}</p>
        </div>
        {canDelete && (
          <div className="flex shrink-0 items-center gap-0.5">
          {canEdit && (
            <button type="button" onClick={onEdit} className="icon-btn !h-7 !w-7" title="Redaktə et" aria-label="İşi redaktə et">
              <Pencil size={14} />
            </button>
          )}
          <ConfirmButton
            onConfirm={onDelete}
            className="icon-btn icon-btn-danger !h-7 !w-7 shrink-0"
            title="İşi sil"
            question="İş qeydi, aktı və şəkilləri silinəcək. Bu əməliyyatı geri qaytarmaq olmur."
          >
            <Trash2 size={14} />
          </ConfirmButton>
          </div>
        )}
      </div>
      <p className="mt-1.5 whitespace-pre-line text-[13px]">{log.description}</p>
      {log.groupFiles && (
        <button type="button" onClick={onOpenGroup} title="Qrup yoldaşının əlavə etdiyi fayllar: bax"
          className="mt-2 flex flex-wrap items-center gap-1.5 rounded-lg bg-violet-50/60 px-2 py-1 text-[11px] font-semibold text-violet-700 hover:bg-violet-50">
          Qrupun faylları <FileBadges files={log.groupFiles} />
        </button>
      )}
      <LogFileTiles files={log.work_files} onPlay={onPlay} />
    </li>
  );
}
