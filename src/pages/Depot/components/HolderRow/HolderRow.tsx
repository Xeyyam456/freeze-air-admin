import { useState } from "react";
import { Trash2, Wrench } from "lucide-react";
import { WriteoffModal, type WriteoffSource } from "@/components/depot/DepotDocs";
import { Avatar } from "@/components/employees/EmployeeForms";
import { ActionForm } from "@/components/forms";
import { QuantityInput } from "@/components/QuantityInput";
import { Button } from "@/shared/components/Button";
import type { HolderRowProps } from "@/types/depot";
import { useHolderReturn } from "../../hooks/useHolderReturn";
import { showQty } from "../../utils/quantity";
import { HeldBadge } from "../HeldBadge";
import { ReceivedBadge } from "../ReceivedBadge";
import { SettleForm } from "../SettleForm";

// Ustadakı alət/material sətri: geri al (alət), təhvil al (material), silinmə aktı.
// Depo məsulu özü qəbul edir (o, qəbul edəndir); ustanın öz qaytarma sorğusu "Təsdiq gözləyir" blokundadır.
export function HolderRow({ holding, canManage, tool, toolName, pendingReturn }: HolderRowProps) {
  const r = useHolderReturn(holding, tool);
  const { unit, material, pack, asking, pending } = r;
  const [writeoff, setWriteoff] = useState(false);
  const who = holding.employees;

  return (
    <li className="py-2.5">
      {writeoff && tool && <WriteoffModal tool={tool} source={{ kind: "holding", holding } satisfies WriteoffSource} onClose={() => setWriteoff(false)} />}
      <div className="flex items-center gap-3">
        {toolName !== undefined ? (
          <>
            <Wrench size={15} className="shrink-0 text-primary" />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{toolName}</span>
          </>
        ) : (
          <>
            <Avatar employee={{ full_name: who?.full_name ?? "?", photo_url: who?.photo_url ?? null }} className="!h-8 !w-8 !text-[11px]" />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{who?.full_name ?? "—"}</span>
          </>
        )}
        <ReceivedBadge h={holding} />
        {pendingReturn && <span className="shrink-0 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary" title="Usta qaytarmaq istəyir: Təsdiq gözləyir blokunda">qaytarır</span>}
        <HeldBadge takenAt={holding.taken_at} always />
        <span className="text-sm font-bold tabular-nums text-primary">{showQty(holding.quantity, unit, pack)}</span>
        {canManage && material && !asking && (
          <Button variant="secondary" size="sm" onClick={() => r.setAsking(true)} className="!h-8">Təhvil al</Button>
        )}
        {canManage && !material && (
          <ActionForm action={r.action} className="flex items-center gap-1.5">
            {asking && (
              <QuantityInput limit={holding.quantity} defaultValue={holding.quantity} className="!h-8 !w-16"
                limitText={(limit) => `Ustada cəmi ${limit} ${unit} var.`} />
            )}
            {holding.quantity > 1 && !asking ? (
              <Button variant="secondary" size="sm" onClick={() => r.setAsking(true)} className="!h-8">Geri al</Button>
            ) : (
              <Button type="submit" variant="secondary" size="sm" disabled={pending} className="!h-8">{pending ? "..." : "Geri al"}</Button>
            )}
          </ActionForm>
        )}
        {canManage && tool && (
          <button type="button" onClick={() => setWriteoff(true)} className="icon-btn icon-btn-danger !h-8 !w-8" title="Silinmə aktı (itib, xarab)" aria-label="Silinmə aktı">
            <Trash2 size={14} />
          </button>
        )}
      </div>
      {canManage && material && asking && <SettleForm r={r} />}
    </li>
  );
}
