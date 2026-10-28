import { useEffect, useState } from "react";
import { Check, Clock, FileText, Hand, Pencil, ShieldAlert, Undo2, X } from "lucide-react";
import { decideRequest, depotFileUrl, returnTool } from "@/actions/tools";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Modal } from "@/shared/components/Modal";
import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { DHead } from "./DepotUi";
import { dateAz, fmt, needsOtherApprover, requestLabel, parseQty, REASONS, REQUEST_TYPES, timeAz, type DepotRequest, type Holding, type Tool } from "./depotUtils";

// Sənədin əsas sətri: nə, nə qədər
function summary(r: DepotRequest) {
  const u = r.tool_kind === "material" ? r.unit : "ədəd";
  switch (r.type) {
    case "receipt": return `+${fmt(r.quantity ?? 0)} ${u} depoya`;
    case "writeoff": return `−${fmt(r.quantity ?? 0)} ${u} · ${REASONS[r.reason ?? "other"]}`;
    case "count": {
      const d = (r.quantity ?? 0) - (r.expected ?? 0);
      return `sistemdə ${fmt(r.expected ?? 0)}, sayılan ${fmt(r.quantity ?? 0)} ${u} (${d > 0 ? "+" : "−"}${fmt(Math.abs(d))})`;
    }
    case "return": return r.tool_kind === "material"
      ? `işlədib ${fmt(r.used ?? 0)} ${u}, qaytarır ${fmt(r.returned ?? 0)} ${u}`
      : `qaytarır ${fmt(r.quantity ?? 0)} ${u}`;
    case "request": return `istəyir ${fmt(r.quantity ?? 0)} ${u}`;
  }
  return "";
}

// İş qeydlərində yazılan sərf (usta götürəndən bəri): material təhvilində və qaytarmasında yoxlama üçün.
// null: hesablanmayıb (material deyil və ya hələ yüklənir)
export function useLoggedUse(employeeId: number | null, toolId: number | null, takenAt: string | null, enabled = true) {
  const [n, setN] = useState<number | null>(null);
  useEffect(() => {
    if (!enabled || !employeeId || !toolId || !takenAt) return;
    let cancelled = false;
    createClient().from("work_log_materials").select("amount, work_logs!inner(employee_id, work_date)")
      .eq("tool_id", toolId).eq("work_logs.employee_id", employeeId).gte("work_logs.work_date", takenAt.slice(0, 10))
      .then(({ data }) => { if (!cancelled) setN((data ?? []).reduce((s, x) => s + x.amount, 0)); });
    return () => { cancelled = true; };
  }, [enabled, employeeId, toolId, takenAt]);
  return n;
}

// Bir sənəd = bir yığcam sətir (50 qaytarma da ekranı doldurmasın): növ, ad + nə qədər, kim/nə vaxt; sağda Qəbul, ✎, ✕.
// Düzəliş (✎) və rədd səbəbi sətrin altında açılır.
// Ustanın istəyi depodan verilə bilərmi (0086): depodakı boş say istənəndən az deyilsə bəli. Başqa sənədlərdə null.
function giveable(r: DepotRequest, tool: Tool | undefined) {
  if (r.type !== "request") return null;
  return !!tool && tool.available >= (r.quantity ?? 0);
}

function RequestRow({ r, holding, tool, myUid, owner }: { r: DepotRequest; holding: Holding | null; tool?: Tool; myUid: string | null; owner: boolean }) {
  const t = { ...REQUEST_TYPES[r.type], label: requestLabel(r) };
  const blocked = needsOtherApprover(r, myUid, owner);
  const mine = r.created_by === myUid;
  const material = r.tool_kind === "material";
  const u = material ? r.unit : "ədəd";
  const [editing, setEditing] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [qty, setQty] = useState(fmt(r.quantity ?? 0));
  const [used, setUsed] = useState(fmt(r.used ?? 0));
  const [ret, setRet] = useState(fmt(r.returned ?? 0));
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const materialReturn = r.type === "return" && material;
  const logged = useLoggedUse(r.employee_id, r.tool_id, holding?.taken_at ?? null, materialReturn);
  // Düzəliş yalnız miqdarı olan sənədlərdə (sayımda sayılan dəyişmir: yenidən sayılsın)
  const editable = r.type !== "count";

  async function decide(approve: boolean) {
    setPending(true);
    const fix = !approve || !editing ? { note } : materialReturn
      ? { used: parseQty(used), returned: parseQty(ret), note }
      : { quantity: parseQty(qty), note };
    const res = await decideRequest(r.id, approve, fix);
    setPending(false);
    if (res?.error) return toast.error(res.error);
    toast.success(approve ? `${t.label} qəbul edildi` : `${t.label} rədd edildi`);
  }

  async function cancel() {
    const { error } = await createClient().rpc("depot_request_cancel", { p_id: r.id });
    if (error) return toast.error(error.message);
    toast.success("Sənəd ləğv edildi");
    revalidate();
  }

  async function openFile() {
    if (!r.photo_path) return;
    const url = await depotFileUrl(r.photo_path);
    if (url) window.open(url, "_blank", "noopener");
    else toast.error("Fayl açılmadı.");
  }

  const who = r.type === "return" || r.type === "request" ? r.created_by_name : `yazdı: ${r.created_by_name ?? "—"}`;
  const can = giveable(r, tool);

  return (
    <li className="py-2.5">
      <div className="flex items-center gap-3">
        <span className={`w-[5.5rem] shrink-0 rounded-full px-2 py-0.5 text-center text-[11px] font-bold ${t.tone}`}>{t.label}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm"><b className="font-semibold">{r.tool_name}</b> <span className="text-ink/70">· {summary(r)}</span></span>
          <span className="muted block truncate text-xs">
            {who} · {dateAz(r.created_at)} {timeAz(r.created_at)}{r.supplier ? ` · ${r.supplier}` : ""}{r.note ? ` · “${r.note}”` : ""}
            {materialReturn && logged !== null && <> · iş qeydlərində {fmt(logged)} {u}</>}
          </span>
        </span>
        {can !== null && (
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${can ? "bg-[#ecfbf1] text-[#15803d]" : "bg-[#fff0f0] text-[#dc2626]"}`}
            title={tool ? `depoda ${fmt(tool.available)} ${u}` : "alət silinib"}>
            {can ? `verilə bilər · depoda ${fmt(tool!.available)}` : `çatmır · depoda ${fmt(tool?.available ?? 0)}`}
          </span>
        )}
        {r.photo_path && (
          <button type="button" onClick={openFile} className="icon-btn !h-8 !w-8" title="Fayla bax" aria-label="Fayla bax"><FileText size={14} /></button>
        )}
        {blocked ? (
          <>
            <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-muted" title="Öz sənədini başqası təsdiqləməlidir"><ShieldAlert size={14} /> başqası təsdiqləyir</span>
            <ConfirmButton onConfirm={cancel} success={false} className="icon-btn !h-8 !w-8" title="Sənədi ləğv et" question="Sənəd ləğv olunacaq." confirmLabel="Bəli, ləğv et">
              <Undo2 size={14} />
            </ConfirmButton>
          </>
        ) : (
          <>
            <button type="button" disabled={pending || (can === false && !editing)} onClick={() => decide(true)} title={can === false && !editing ? "Depoda çatmır: ✎ ilə az ver və ya rədd et" : "Qəbul et"}
              className="btn btn-primary btn-sm !h-8 !px-3"><Check size={14} /> Qəbul</button>
            {editable && (
              <button type="button" onClick={() => setEditing((v) => !v)} aria-pressed={editing} title="Miqdarı düzəlt" aria-label="Miqdarı düzəlt"
                className={`icon-btn !h-8 !w-8 ${editing ? "!bg-primary-soft !text-primary" : ""}`}><Pencil size={14} /></button>
            )}
            <button type="button" onClick={() => setRejecting((v) => !v)} className="icon-btn icon-btn-danger !h-8 !w-8" title="Rədd et" aria-label="Rədd et"><X size={15} /></button>
            {mine && r.type !== "return" && r.type !== "request" && (
              <ConfirmButton onConfirm={cancel} success={false} className="icon-btn !h-8 !w-8" title="Sənədi ləğv et" question="Sənəd ləğv olunacaq." confirmLabel="Bəli, ləğv et">
                <Undo2 size={14} />
              </ConfirmButton>
            )}
          </>
        )}
      </div>

      {editing && (
        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl bg-bg p-2.5 sm:ml-[6.25rem]">
          {materialReturn ? (
            <>
              <label className="flex items-center gap-1.5 text-xs font-semibold">İşlədib
                <input inputMode="decimal" value={used} onChange={(e) => setUsed(e.target.value)} className="field !h-8 !w-16 !px-2 !text-[13px]" />
              </label>
              <label className="flex items-center gap-1.5 text-xs font-semibold">Qaytarır
                <input inputMode="decimal" value={ret} onChange={(e) => setRet(e.target.value)} className="field !h-8 !w-16 !px-2 !text-[13px]" />
              </label>
            </>
          ) : (
            <label className="flex items-center gap-1.5 text-xs font-semibold">Faktiki
              <input inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value)} className="field !h-8 !w-20 !px-2 !text-[13px]" />
            </label>
          )}
          <span className="muted text-xs">{u} · sonra «Qəbul» bas</span>
        </div>
      )}
      {rejecting && (
        <div className="mt-2 flex gap-2 sm:ml-[6.25rem]">
          <input value={note} onChange={(e) => setNote(e.target.value)} autoFocus placeholder="Rədd səbəbi (istəyə görə)" className="field !h-9 flex-1 !text-[13px]" />
          <button type="button" disabled={pending} onClick={() => decide(false)} className="btn btn-sm !h-9 bg-danger text-white hover:bg-danger/90">Rədd et</button>
        </div>
      )}
    </li>
  );
}

// Usta "Almadım" deyib: depo məsulu yoxlayır; doğrudursa depoya qaytarır (təhvil bağlanır)
function DisputeRow({ h, tool }: { h: Holding; tool: Tool | undefined }) {
  const u = tool?.kind === "material" ? tool.unit : "ədəd";
  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className="w-[5.5rem] shrink-0 rounded-full bg-danger px-2 py-0.5 text-center text-[11px] font-bold text-white">Almadım</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm"><b className="font-semibold">{tool?.name ?? "—"}</b> <span className="text-ink/70">· {fmt(h.quantity)} {u}</span></span>
        <span className="muted block truncate text-xs">{h.employees?.full_name ?? "usta"} almadığını deyir · verilib {dateAz(h.taken_at)}</span>
      </span>
      <ConfirmButton className="btn btn-secondary btn-sm !h-8" title="Depoya qaytar" confirmLabel="Bəli, qaytar" success={false}
        question={`${tool?.name ?? "Alət"} (${fmt(h.quantity)} ${u}) ${h.employees?.full_name ?? "usta"} üzərindən götürülüb depoya qaytarılacaq.`}
        onConfirm={async () => {
          const r = await returnTool(h.id, h.quantity);
          if (r?.error) toast.error(r.error); else toast.success("Depoya qaytarıldı");
        }}>
        <Undo2 size={14} /> Depoya qaytar
      </ConfirmButton>
    </li>
  );
}

// "Təsdiq gözləyir": səhifədə yalnız nazik zolaq (sayı ilə), basanda pəncərə açılır: yığcam sətirlər + "Hamısını qəbul et".
// (Əvvəl hər sənəd iri kart idi: 50 qaytarma bütün ekranı tuturdu.) Boşdursa heç nə göstərmir.
export function PendingBlock({ requests, holdings, tools, myUid, owner }: {
  requests: DepotRequest[]; holdings: Holding[]; tools: Tool[]; myUid: string | null; owner: boolean;
}) {
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
