import { useState } from "react";
import { Check, Clock, Hand } from "lucide-react";
import { decideRequest } from "@/services/depot/documents";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Modal } from "@/shared/components/Modal";
import { toast } from "@/lib/toast";
import { DHead } from "../DHead";
import { needsOtherApprover } from "../../utils/requests";
import { REQUEST_TYPES } from "../../constants/requests";
import type { PendingBlockProps } from "@/types/depot";
import { giveable } from "../../utils/giveable";
import { RequestRow } from "../RequestRow";
import { DisputeRow } from "../DisputeRow";

// "Təsdiq gözləyir": səhifədə yalnız nazik zolaq (sayı ilə), basanda pəncərə açılır: yığcam sətirlər + "Hamısını qəbul et".
// (Əvvəl hər sənəd iri kart idi: 50 qaytarma bütün ekranı tuturdu.) Boşdursa heç nə göstərmir.
export function PendingBlock({ requests, holdings, tools, myUid, owner }: PendingBlockProps) {
  const [open, setOpen] = useState(false);
  const [bulk, setBulk] = useState(false);
  const disputes = holdings.filter((h) => h.disputed_at && !h.received_at);
  const total = requests.length + disputes.length;
  if (total === 0) return null;
  const toolOf = new Map(tools.map((t) => [t.id, t]));
  const holdingOf = new Map(holdings.map((h) => [h.id, h]));
  const approvable = requests.filter((r) => !needsOtherApprover(r, myUid, owner) && giveable(r, toolOf.get(r.tool_id ?? 0)) !== false);
  const counts = requests.reduce<Record<string, number>>((m, r) => ({ ...m, [r.type]: (m[r.type] ?? 0) + 1 }), {});
  const parts = Object.entries(counts).map(([k, n]) => `${n} ${(REQUEST_TYPES[k]?.label ?? k).toLocaleLowerCase("az")}`);
  if (disputes.length) parts.unshift(`${disputes.length} «almadım»`);

  // Hamısını qəbul et: hər sənəd ayrıca (baza qaydaları hər birində işləyir); alınmayanlar siyahıda qalır
  async function approveAll(list = approvable) {
    setBulk(true);
    let failed = 0;
    for (const r of list) {
      const res = await decideRequest(r.id, true);
      if (res?.error) failed++;
    }
    setBulk(false);
    if (failed) toast.error(`${list.length - failed} qəbul edildi, ${failed} alınmadı`);
    else toast.success(`${list.length} sənəd qəbul edildi`);
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-[#fde3b4] bg-[#fffaf0] px-4 py-3 text-left transition-colors hover:bg-[#fff4e0]">
        <Clock size={18} className="shrink-0 text-[#b45309]" />
        <b className="text-sm">Təsdiq gözləyir</b>
        <span className="rounded-full bg-danger px-2 py-0.5 text-[11px] font-bold text-white">{total}</span>
        <span className="muted min-w-0 flex-1 truncate text-[13px]">{parts.join(" · ")}</span>
        <span className="shrink-0 text-sm font-semibold text-primary">Bax →</span>
      </button>
      {open && (
        <Modal onClose={() => setOpen(false)} labelledBy="pending-title" className="flex !max-w-3xl flex-col">
          <DHead id="pending-title" icon={Clock} tone="amber" title={`Təsdiq gözləyir (${total})`} sub="Təsdiqlənməyən heç nə depoya düşmür və depodan çıxmır" onClose={() => setOpen(false)}>
            {approvable.length > 1 && (
              <ConfirmButton onConfirm={() => approveAll()} success={false} className="btn btn-primary btn-sm !h-9" title="Hamısını qəbul et" confirmLabel="Bəli, qəbul et"
                question={`${approvable.length} sənəd olduğu kimi qəbul ediləcək (say dərhal dəyişir). Depoda çatmayan istəklər qəbul edilmir.`}>
                <Check size={14} /> {bulk ? "Gözləyin..." : `Hamısını qəbul et (${approvable.length})`}
              </ConfirmButton>
            )}
          </DHead>
          <ul className="nice-scroll max-h-[min(560px,calc(100dvh/var(--zoom)-180px))] divide-y divide-line overflow-y-auto pr-1">
            {disputes.map((h) => <DisputeRow key={`d${h.id}`} h={h} tool={toolOf.get(h.tool_id)} />)}
            {requests.map((r) => {
              const row = <RequestRow key={r.id} r={r} holding={r.assignment_id ? holdingOf.get(r.assignment_id) ?? null : null} tool={toolOf.get(r.tool_id ?? 0)} myUid={myUid} owner={owner} />;
              const group = r.batch ? requests.filter((x) => x.batch === r.batch) : [];
              if (group.length < 2) return row;
              if (group[0].id !== r.id) return null; // qrup ilk üzvündə bütöv çəkilir
              const ok = group.filter((x) => giveable(x, toolOf.get(x.tool_id ?? 0)));
              return (
                <li key={`b${r.batch}`} className="py-2.5">
                  <div className="flex flex-wrap items-center gap-2 rounded-xl bg-[#f6f3ff] px-3 py-2.5">
                    <Hand size={16} className="shrink-0 text-[#6d28d9]" />
                    <b className="text-sm">{r.created_by_name ?? "Usta"}: {group.length} şey istəyir</b>
                    <span className="text-xs font-semibold text-[#15803d]">{ok.length} verilə bilər</span>
                    {group.length - ok.length > 0 && <span className="text-xs font-semibold text-[#dc2626]">· {group.length - ok.length} depoda çatmır</span>}
                    {ok.length > 0 && (
                      <ConfirmButton onConfirm={() => approveAll(ok.filter((x) => !needsOtherApprover(x, myUid, owner)))} success={false} className="btn btn-primary btn-sm ml-auto !h-8"
                        title="Verilə bilənləri qəbul et" confirmLabel="Bəli, ver" question={`${ok.length} istək qəbul ediləcək və ustaya veriləcək. Çatmayanlar gözləməyə qalır (rədd edə bilərsən).`}>
                        <Check size={14} /> Verilə bilənləri ver ({ok.length})
                      </ConfirmButton>
                    )}
                  </div>
                  <ul className="ml-3 divide-y divide-line border-l-2 border-[#ddd6fe] pl-3">
                    {group.map((x) => <RequestRow key={x.id} r={x} holding={null} tool={toolOf.get(x.tool_id ?? 0)} myUid={myUid} owner={owner} />)}
                  </ul>
                </li>
              );
            })}
          </ul>
        </Modal>
      )}
    </>
  );
}
