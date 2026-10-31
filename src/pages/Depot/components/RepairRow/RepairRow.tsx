import { useState } from "react";
import { finishRepair } from "@/services/depot/repairs";
import { ConfirmButton } from "@/components/ConfirmButton";
import { toast } from "@/lib/toast";
import { dateAz, daysSince } from "../../utils/dates";
import type { RepairRowProps } from "@/types/depot";
import { Button } from "@/shared/components/Button";

// Təmirdə olan: harada, nə vaxtdan; qayıdanda "Düzəldi" (depoya) və ya "Bərpa olunmadı" (silinmə aktı gözləməyə düşür)
export function RepairRow({ r, unit, canManage }: RepairRowProps) {
  const [pending, setPending] = useState(false);
  async function finish(fixed: boolean) {
    setPending(true);
    const res = await finishRepair(r.id, fixed);
    setPending(false);
    if (res?.error) return toast.error(res?.error);
    toast.success(fixed ? "Təmirdən qayıtdı: depoya" : "Bərpa olunmadı: silinmə aktı təsdiq gözləyir");
  }
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2">
      <span className="text-sm font-bold tabular-nums">{r.quantity} {unit}</span>
      <span className="muted min-w-0 flex-1 truncate text-[13px]">
        {r.place ?? "Təmirdə"} · {dateAz(r.sent_at)} ({daysSince(r.sent_at)} gün){r.note ? ` · ${r.note}` : ""}
      </span>
      {canManage && (
        <span className="flex gap-1.5">
          <Button type="button" disabled={pending} onClick={() => finish(true)} variant="secondary" size="sm" className="!h-8">Düzəldi</Button>
          <ConfirmButton onConfirm={() => finish(false)} success={false} className="btn btn-cancel btn-sm !h-8" title="Bərpa olunmadı"
            question="Depoya qayıdır və silinmə aktı (xarab) yazılır; başqası təsdiqləyəndə depodan silinir." confirmLabel="Bəli">
            Bərpa olunmadı
          </ConfirmButton>
        </span>
      )}
    </li>
  );
}
