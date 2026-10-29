import { ArrowRight, Undo2, UserPlus } from "lucide-react";
import type { SingleTaskRowProps } from "@/types/tasks";
import { hasVideo, placeOf } from "../../utils/labels";
import { FilesBadge } from "../FilesBadge";
import { TaskStatusIcon } from "../TaskStatusIcon";

// Tək tapşırıq: vəziyyət, yer, səbəb, təmir qeydi, "Geri alınıb → Ad", fayllar; görülməyibsə "usta əlavə et" və "geri al"
export function SingleTaskRow({ t, actions }: SingleTaskRowProps) {
  const cancelled = !!t.cancelled_at;
  const files = t.work_logs?.work_files.length ?? 0;
  const logId = t.work_log_id;
  return (
    <li className={`flex flex-wrap items-start gap-3 px-4 py-3 max-sm:gap-2 max-sm:px-3 max-sm:py-2 ${cancelled ? "opacity-60" : t.done ? "bg-[#f6fcf8]" : ""}`}>
      {/* Yalnız vəziyyət: "görüldü"nü usta özü işarələyir */}
      <TaskStatusIcon t={t} cancelled={cancelled} done={!!t.done} />
      <span role={logId ? "button" : undefined} tabIndex={logId ? 0 : undefined} title={logId ? "İşi aç: şəkillər və təfərrüat" : undefined}
        onClick={logId ? () => actions.onOpenLog(logId) : undefined}
        onKeyDown={logId ? (e) => e.key === "Enter" && actions.onOpenLog(logId) : undefined}
        className={`min-w-0 flex-1 ${logId ? "cursor-pointer rounded-lg transition-colors hover:bg-black/[0.03]" : ""}`}>
        <span className={`block truncate text-sm font-bold ${cancelled ? "text-muted line-through" : t.done ? "text-ok" : "text-ink"}`}>{placeOf(t)}</span>
        <span className={`muted block text-[13px] max-sm:text-xs ${cancelled ? "line-through" : ""}`}>{t.reason}</span>
        {t.note && <span className="mt-1.5 block rounded-lg bg-[#eef2ff] px-2.5 py-1 text-xs text-[#4338ca] max-sm:hidden"><b>Təmir:</b> {t.note}</span>}
        {cancelled && (
          <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-muted">
            Geri alınıb{t.nextName && <><ArrowRight size={11} /> {t.nextName}</>}
          </span>
        )}
      </span>
      {files > 0 && <FilesBadge files={files} video={hasVideo([t])} />}
      {!cancelled && !t.done && !actions.past && (
        <span className="flex shrink-0 items-center gap-0.5">
          <button type="button" onClick={() => actions.onAdd({ task: t, members: [t.employee_id] })} className="icon-btn !h-8 !w-8 max-sm:!h-7 max-sm:!w-7" title="Usta əlavə et (qrup tapşırığı olur)" aria-label="Usta əlavə et">
            <UserPlus size={15} />
          </button>
          <button type="button" onClick={() => actions.onWithdraw(t)} className="icon-btn !h-8 !w-8" title="Geri al (başqa ustaya ver)" aria-label="Tapşırığı geri al">
            <Undo2 size={15} />
          </button>
        </span>
      )}
      {t.note && <div className="basis-full sm:hidden"><span className="block rounded-lg bg-[#eef2ff] px-2.5 py-1.5 text-xs leading-snug text-[#4338ca]"><b>Təmir:</b> {t.note}</span></div>}
    </li>
  );
}
