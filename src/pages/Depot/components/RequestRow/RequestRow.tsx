import { Check, FileText, Pencil, ShieldAlert, Undo2, X } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Button } from "@/shared/components/Button";
import type { RequestRowProps } from "@/types/depot";
import { useRequestDecision } from "../../hooks/useRequestDecision";
import { dateAz, timeAz } from "../../utils/dates";
import { fmt } from "../../utils/quantity";
import { summary } from "../../utils/requestSummary";
import { RequestEdit } from "../RequestEdit";
import { RequestReject } from "../RequestReject";

// Bir sənəd = bir yığcam sətir (50 qaytarma da ekranı doldurmasın): növ, ad + nə qədər, kim/nə vaxt; sağda Qəbul, ✎, ✕.
// Düzəliş (✎) və rədd səbəbi sətrin altında açılır.
export function RequestRow(props: RequestRowProps) {
  const { r, tool } = props;
  const d = useRequestDecision(props);
  const { t, u, can, editing, pending } = d;
  const cancelButton = (
    <ConfirmButton onConfirm={d.cancel} success={false} className="icon-btn !h-8 !w-8" title="Sənədi ləğv et" question="Sənəd ləğv olunacaq." confirmLabel="Bəli, ləğv et">
      <Undo2 size={14} />
    </ConfirmButton>
  );

  return (
    <li className="rounded-2xl border border-line bg-surface p-3 transition-colors hover:border-[#fcd9a0] max-sm:p-2.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="min-w-0 flex-1 basis-56">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${t.tone}`}>{t.label}</span>
            <b className="text-sm font-semibold max-sm:text-[13px]">{r.tool_name}</b>
            <span className="text-sm font-bold tabular-nums text-primary max-sm:text-[13px]">{summary(r)}</span>
          </span>
          <span className="muted mt-1 block text-xs max-sm:text-[11px]">
            {d.who} · {dateAz(r.created_at)} {timeAz(r.created_at)}{r.supplier ? ` · ${r.supplier}` : ""}{r.note ? ` · “${r.note}”` : ""}
            {d.materialReturn && d.logged !== null && <> · iş qeydlərində {fmt(d.logged)} {u}</>}
          </span>
        </span>
        {can !== null && (
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${can ? "bg-[#ecfbf1] text-[#15803d]" : "bg-[#fff0f0] text-[#dc2626]"}`}
            title={tool ? `depoda ${fmt(tool.available)} ${u}` : "alət silinib"}>
            {can ? `verilə bilər · depoda ${fmt(tool!.available)}` : `çatmır · depoda ${fmt(tool?.available ?? 0)}`}
          </span>
        )}
        <span className="ml-auto flex items-center gap-1.5 max-sm:w-full">
          {r.photo_path && (
            <button type="button" onClick={d.openFile} className="icon-btn !h-8 !w-8" title="Fayla bax" aria-label="Fayla bax"><FileText size={14} /></button>
          )}
          {d.blocked ? (
            <>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-muted" title="Öz sənədini başqası təsdiqləməlidir"><ShieldAlert size={14} /> başqası təsdiqləyir</span>
              {cancelButton}
            </>
          ) : (
            <>
              <Button size="sm" disabled={pending || (can === false && !editing)} onClick={() => d.decide(true)} className="!h-8 !rounded-full !px-4 max-sm:flex-1"
                title={can === false && !editing ? "Depoda çatmır: ✎ ilə az ver və ya rədd et" : "Qəbul et"}><Check size={14} /> Qəbul</Button>
              {d.editable && (
                <button type="button" onClick={() => d.setEditing((v) => !v)} aria-pressed={editing} title="Miqdarı düzəlt" aria-label="Miqdarı düzəlt"
                  className={`icon-btn !h-8 !w-8 border border-line ${editing ? "!bg-primary-soft !text-primary" : ""}`}><Pencil size={14} /></button>
              )}
              <button type="button" onClick={() => d.setRejecting((v) => !v)} className="icon-btn icon-btn-danger !h-8 !w-8 border border-line" title="Rədd et" aria-label="Rədd et"><X size={15} /></button>
              {d.mine && r.type !== "return" && r.type !== "request" && cancelButton}
            </>
          )}
        </span>
      </div>
      {editing && <RequestEdit d={d} />}
      {d.rejecting && <RequestReject d={d} />}
    </li>
  );
}
