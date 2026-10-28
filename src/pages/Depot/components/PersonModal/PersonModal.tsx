import { useState } from "react";
import { Package, Plus, Undo2, Wrench } from "lucide-react";
import { returnAllTools } from "@/services/depot";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Modal } from "@/shared/components/Modal";
import { toast } from "@/lib/toast";
import { Button } from "@/shared/components/Button";
import type { Kind, PersonModalProps } from "@/types/depot";
import { BulkGiveModal } from "../BulkGiveModal";
import { HolderRow } from "../HolderRow";
import { PersonHead } from "../PersonHead";

// Ustanın pəncərəsi (2026-10-23 yeni dizayn): bənövşəyi başlıq (şəkil, ad, vəzifə), 3 göstərici, Alətlər | Materiallar tabı,
// əməliyyatlar (ver, hamısını geri al), haşiyəli siyahı (geri al / təhvil al / silinmə aktı)
export function PersonModal({ emp, kind: initialKind, holds: allHolds, toolInfo, tools: allTools, requests, canManage, onClose }: PersonModalProps) {
  const [kind, setKind] = useState<Kind>(initialKind);
  const [giving, setGiving] = useState(false);
  const ofKind = (k: Kind) => allHolds.filter((h) => (toolInfo.get(h.tool_id)?.kind ?? "tool") === k);
  const holds = ofKind(kind);
  const toolsN = ofKind("tool").reduce((n, h) => n + h.quantity, 0);
  const matsN = ofKind("material").length;
  const waiting = allHolds.filter((h) => !h.received_at).length;
  const pendingReturns = new Set(requests.filter((r) => r.type === "return" && r.assignment_id).map((r) => r.assignment_id!));
  const tabs: [Kind, string, number][] = [["tool", "Alətlər", toolsN], ["material", "Materiallar", matsN]];
  return (
    <Modal onClose={onClose} labelledBy={`emp-${emp.id}-title`} className="!max-w-2xl">
      {giving && <BulkGiveModal emp={emp} kind={kind} tools={allTools.filter((t) => t.kind === kind)} onClose={() => setGiving(false)} />}
      <PersonHead emp={emp} toolsN={toolsN} matsN={matsN} waiting={waiting} onClose={onClose} />

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-xl bg-line/60 p-1" role="tablist" aria-label="Növ">
          {tabs.map(([k, l, n]) => (
            <button key={k} type="button" role="tab" aria-selected={kind === k} onClick={() => setKind(k)}
              className={`inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-[13px] font-semibold transition-colors ${kind === k ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
              {k === "tool" ? <Wrench size={14} /> : <Package size={14} />} {l}
              <span className="rounded-full bg-bg px-1.5 text-[11px] font-bold text-muted">{n}</span>
            </button>
          ))}
        </div>
        {canManage && (
          <span className="ml-auto flex gap-2">
            {/* Yalnız alətdə: materialda "nə qədər işlədi" deyilməlidir, ona görə tək-tək təhvil alınır */}
            {kind === "tool" && holds.length > 1 && (
              <ConfirmButton className="btn btn-secondary btn-sm !h-9" title="Hamısını geri al" confirmLabel="Bəli, geri al" success={false}
                question={`${emp.full_name} üzərindəki ${toolsN} ədəd alət depoya qaytarılacaq.`}
                onConfirm={async () => {
                  const r = await returnAllTools(holds.map((h) => ({ id: h.id, quantity: h.quantity })));
                  if (r?.error) toast.error(r.error); else toast.success("Hamısı geri alındı");
                }}>
                <Undo2 size={14} /> Hamısını geri al
              </ConfirmButton>
            )}
            <Button size="sm" onClick={() => setGiving(true)} className="!h-9">
              <Plus size={14} /> {kind === "tool" ? "Alət ver" : "Material ver"}
            </Button>
          </span>
        )}
      </div>

      {holds.length > 0 ? (
        <ul className="nice-scroll mt-4 max-h-[min(400px,calc(100vh/var(--zoom)-380px))] divide-y divide-line overflow-y-auto rounded-2xl border border-line px-3">
          {holds.map((h) => (
            <HolderRow key={h.id} holding={h} canManage={canManage} tool={toolInfo.get(h.tool_id)} toolName={toolInfo.get(h.tool_id)?.name ?? "—"}
              pendingReturn={pendingReturns.has(h.id)} />
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-line py-8 text-center">
          <span className="mx-auto mb-2 grid h-11 w-11 place-items-center rounded-2xl bg-bg text-muted">{kind === "tool" ? <Wrench size={20} /> : <Package size={20} />}</span>
          <p className="text-sm font-semibold">{kind === "tool" ? "Üzərində alət yoxdur" : "Üzərində material yoxdur"}</p>
        </div>
      )}
    </Modal>
  );
}
