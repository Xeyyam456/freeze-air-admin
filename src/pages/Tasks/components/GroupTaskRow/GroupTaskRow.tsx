import { Undo2, UserPlus } from "lucide-react";
import type { GroupTaskRowProps } from "@/types/tasks";
import { hasVideo, placeOf } from "../../utils/labels";
import { FilesBadge } from "../FilesBadge";
import { TaskStatusIcon } from "../TaskStatusIcon";

// Qrupun bir tapşırığı: vəziyyət, yer, səbəb, təmir qeydi, fayllar; görülməyibsə "usta əlavə et" və "geri al"
export function GroupTaskRow({ g, actions }: GroupTaskRowProps) {
  const t = g.live[0] ?? g.rows[0];
  const cancelled = g.live.length === 0;
  const done = !cancelled && g.live.every((x) => x.done);
  const files = g.rows.reduce((n, x) => n + (x.work_logs?.work_files.length ?? 0), 0);
  const logId = g.rows.find((x) => x.work_log_id)?.work_log_id ?? null;
  return (
    <li className={cancelled ? "opacity-60" : done ? "bg-[#f6fcf8]" : ""}>
      <div className="flex items-start gap-3 px-4 py-3 max-sm:gap-2 max-sm:px-3 max-sm:py-2">
        <TaskStatusIcon t={t} cancelled={cancelled} done={done} />
        <span role={logId ? "button" : undefined} tabIndex={logId ? 0 : undefined} title={logId ? "İşi aç: şəkillər və təfərrüat" : undefined}
          onClick={logId ? () => actions.onOpenLog(logId) : undefined}
          onKeyDown={logId ? (e) => e.key === "Enter" && actions.onOpenLog(logId) : undefined}
          className={`min-w-0 flex-1 ${logId ? "cursor-pointer rounded-lg transition-colors hover:bg-black/[0.03]" : ""}`}>
          <span className={`block truncate text-sm font-bold max-sm:text-[13px] ${cancelled ? "text-muted line-through" : done ? "text-ok" : "text-ink"}`}>{placeOf(t)}</span>
          <span className={`muted block text-[13px] max-sm:text-xs ${cancelled ? "line-through" : ""}`}>{t.reason}</span>
          {t.note && <span className="mt-1.5 block rounded-lg bg-[#eef2ff] px-2.5 py-1 text-xs text-[#4338ca] max-sm:hidden"><b>Təmir:</b> {t.note}</span>}
        </span>
        {files > 0 && <FilesBadge files={files} video={hasVideo(g.rows)} />}
        {!done && !cancelled && !actions.past && (
          <span className="flex shrink-0 items-center gap-0.5">
            <button type="button" onClick={() => actions.onAdd({ task: t, members: g.live.map((x) => x.employee_id) })} className="icon-btn !h-8 !w-8"
              title="Qrupa usta əlavə et" aria-label="Qrupa usta əlavə et">
              <UserPlus size={15} />
            </button>
            <button type="button" onClick={() => actions.onWithdrawGroup(g.live)} className="icon-btn !h-8 !w-8"
              title="Görülməyib: geri al" aria-label="Tapşırığı geri al">
              <Undo2 size={15} />
            </button>
          </span>
        )}
      </div>
      {t.note && <div className="px-3 pb-2 sm:hidden"><span className="block rounded-lg bg-[#eef2ff] px-2.5 py-1.5 text-xs leading-snug text-[#4338ca]"><b>Təmir:</b> {t.note}</span></div>}
    </li>
  );
}
