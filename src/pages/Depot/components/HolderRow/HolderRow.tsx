import { useState } from "react";
import { Trash2, Wrench } from "lucide-react";
import { WriteoffModal } from "../WriteoffModal";
import type { WriteoffSource } from "@/types/depot/WriteoffSource";
import { Avatar } from "@/shared/components/Avatar";
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
      {/* Dar ekranda nişanlar, say və düymələr ikinci sətrə keçir (pəncərədən çıxmasın) */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 max-sm:gap-x-1.5">
        {toolName !== undefined ? (
          <>
            <Wrench size={15} className="shrink-0 text-primary max-sm:hidden" />
            <span className="min-w-0 flex-1 basis-32 max-sm:basis-0 truncate text-sm font-semibold max-sm:whitespace-normal max-sm:break-words max-sm:text-xs max-sm:leading-tight max-sm:[text-overflow:clip] max-sm:order-1">{toolName}</span>
          </>
        ) : (
          <>
            <Avatar employee={{ full_name: who?.full_name ?? "?", photo_url: who?.photo_url ?? null }} className="!h-8 !w-8 !text-[11px] max-sm:order-1" />
            <span className="min-w-0 flex-1 basis-32 max-sm:basis-0 truncate text-sm font-semibold max-sm:whitespace-normal max-sm:break-words max-sm:text-xs max-sm:leading-tight max-sm:[text-overflow:clip] max-sm:order-1">{who?.full_name ?? "—"}</span>
          </>
        )}
        {/* Mobildə: 1-ci sətir ad + say, 2-ci sətir nişanlar solda, düymələr sağda */}
        <span className="flex items-center gap-2 max-sm:order-2 max-sm:gap-1.5">
          <ReceivedBadge h={holding} />
          {pendingReturn && <span className="shrink-0 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary" title="Usta qaytarmaq istəyir: Təsdiq gözləyir blokunda">qaytarır</span>}
          <HeldBadge takenAt={holding.taken_at} always />
        </span>
        <span className="text-sm font-bold tabular-nums text-primary max-sm:order-1 max-sm:text-[11px]">{showQty(holding.quantity, unit, pack)}</span>
        <span className="hidden h-0 basis-full max-sm:order-1 max-sm:block" aria-hidden />
        {/* Düymələr bir qrupdadır: mobildə həmişə sağda (Təhvil al gizlənəndə də sil sağda qalır) */}
        <span className="contents max-sm:order-2 max-sm:ml-auto max-sm:flex max-sm:items-center max-sm:gap-1.5">
        {canManage && material && !asking && (
          <Button variant="secondary" size="sm" onClick={() => r.setAsking(true)} className="!h-8 max-sm:!h-6 max-sm:!px-2 max-sm:!text-[11px]">Təhvil al</Button>
        )}
        {canManage && !material && (
          <ActionForm action={r.action} className="flex items-center gap-1.5">
            {asking && (
              <QuantityInput limit={holding.quantity} defaultValue={holding.quantity} className="!h-8 !w-16"
                limitText={(limit) => `Ustada cəmi ${limit} ${unit} var.`} />
            )}
            {holding.quantity > 1 && !asking ? (
              <Button variant="secondary" size="sm" onClick={() => r.setAsking(true)} className="!h-8 max-sm:!h-6 max-sm:!px-2 max-sm:!text-[11px]">Geri al</Button>
            ) : (
              <Button type="submit" variant="secondary" size="sm" disabled={pending} className="!h-8 max-sm:!h-6 max-sm:!px-2 max-sm:!text-[11px]">{pending ? "..." : "Geri al"}</Button>
            )}
          </ActionForm>
        )}
        {canManage && tool && (
          <button type="button" onClick={() => setWriteoff(true)} className="icon-btn icon-btn-danger !h-8 !w-8 max-sm:!h-6 max-sm:!w-6" title="Silinmə aktı (itib, xarab)" aria-label="Silinmə aktı">
            <Trash2 size={14} />
          </button>
        )}
        </span>
      </div>
      {canManage && material && asking && <SettleForm r={r} />}
    </li>
  );
}
