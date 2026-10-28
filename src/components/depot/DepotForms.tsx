
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { rectOf, viewport } from "@/lib/zoom";
import { createPortal } from "react-dom";
import {
  ChevronDown, Clock, History, KeyRound, Package, PackageOpen, PackagePlus, Pencil, Plus, Search, Send, ShieldCheck, Trash2, Undo2, UserPlus, Users, Warehouse, Wrench, X,
} from "lucide-react";
import { deleteTool, finishRepair, givePiece, giveTool, giveTools, returnAllTools, returnTool, settleMaterial, updateTool } from "@/services/depot";
import { addStorekeeper, setStorekeeper } from "@/services/storekeeper/storekeeper";
import { ConfirmButton } from "@/components/ConfirmButton";
import { useLoggedUse } from "@/components/depot/Approvals";
import { RepairModal, ToolFields, WriteoffModal, type WriteoffSource } from "@/components/depot/DepotDocs";
import { HistoryModal } from "@/components/depot/HistoryModal";
import { AccountSection, Avatar, type Accounts } from "@/components/employees/EmployeeForms";
import { ActionForm, Buttons, Field, SaveConfirmForm, useOnSuccess } from "@/components/forms";
import { Modal } from "@/shared/components/Modal";
import { useEscapeLayer } from "@/shared/hooks/useEscapeLayer";
import { giveLimitText, QuantityInput } from "@/components/QuantityInput";
import { ToolPicker } from "@/components/ToolPicker";
import { toast } from "@/lib/toast";
import { DAction, DHead, DSection, DStat } from "@/pages/Depot/components/ui";
import {
  dateAz, daysSince, fmt, isPacked, REASONS, norm, parseQty, PIECE_MAX, pieceWord, round2, showQty, STALE_DAYS, TEXT, withUnit,
  type DepotEmployee, type DepotRequest, type Holding, type Kind, type Loss, type PackInfo, type Piece, type Repair, type Tool,
} from "@/pages/Depot/utils";

export function HeldBadge({ takenAt, always = false }: { takenAt: string; always?: boolean }) {
  const d = daysSince(takenAt);
  const stale = d >= STALE_DAYS;
  if (!stale && !always) return null;
  return (
    <span title={`Götürüb: ${dateAz(takenAt)}`} className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${stale ? "bg-[#fff4e0] text-[#b45309]" : "muted"}`}>
      {d === 0 ? "bu gün" : `${d} gün`}
    </span>
  );
}

// Ustanın təsdiqi (0084): verilib, usta hələ "Aldım" basmayıb / "Almadım" deyib
function ReceivedBadge({ h }: { h: Holding }) {
  if (h.received_at) return null;
  return h.disputed_at
    ? <span className="shrink-0 rounded-full bg-danger px-2 py-0.5 text-[11px] font-bold text-white" title="Usta bunu almadığını deyir">almadım</span>
    : <span className="shrink-0 rounded-full bg-[#fff4e0] px-2 py-0.5 text-[11px] font-bold text-[#b45309]" title="Usta hələ «Aldım» basmayıb">təsdiq gözləyir</span>;
}

// Bir ustadakı say: "×2" (alət) | "5 metr" (material)
function holdQty(h: Holding, t: Tool) {
  return t.kind === "material" ? `${fmt(h.quantity)} ${t.unit}` : h.quantity > 1 ? `×${h.quantity}` : "";
}

// Siyahıda "Kimdədir": həmişə "N usta" düyməsi (1 usta olsa da), basanda ad siyahısı açılır
// (10 adı sətirə sığdırmaq olmur). Siyahı cədvəlin sürüşməsindən kəsilməsin deyə body-də açılır.
export function HoldersCell({ holders, tool }: { holders: Holding[]; tool: Tool }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  useEscapeLayer(() => setPos(null), pos !== null);
  useEffect(() => {
    if (!pos) return;
    const close = () => setPos(null);
    const onDown = (e: MouseEvent) => {
      if (!(e.target as Element).closest("[data-holders-pop]") && !btn.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [pos]);

  const oldest = holders.reduce<Holding | null>((o, h) => (!o || h.taken_at < o.taken_at ? h : o), null);
  const unconfirmed = holders.some((h) => !h.received_at);
  return (
    <>
      <span className="flex items-center gap-2">
        <button ref={btn} type="button" aria-expanded={pos !== null} aria-haspopup="true"
          onClick={(e) => {
            e.stopPropagation();
            if (pos) return setPos(null);
            const r = rectOf(e.currentTarget);
            setPos({ top: r.bottom + 6, left: Math.min(r.left, viewport().w - 320) });
          }}
          className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-primary-soft px-2.5 text-[13px] font-semibold text-primary transition-colors hover:bg-[#dbe8ff]">
          {holders.length} usta <ChevronDown size={13} className={pos ? "rotate-180" : ""} />
        </button>
        {unconfirmed && <Clock size={14} className="shrink-0 text-[#b45309]" aria-label="Təsdiq gözləyən var" />}
        {oldest && <HeldBadge takenAt={oldest.taken_at} />}
      </span>
      {pos && createPortal(
        <div data-holders-pop style={{ top: pos.top, left: pos.left }}
          className="fixed z-50 w-[19rem] rounded-xl border border-line bg-surface p-1.5 shadow-[0_16px_40px_rgba(16,24,40,0.18)]">
          <ul className="nice-scroll max-h-64 overflow-y-auto">
            {holders.map((h) => (
              <li key={h.id} className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px]">
                <span className="min-w-0 flex-1 truncate font-semibold">{h.employees?.full_name ?? "?"}</span>
                <span className="tabular-nums text-primary">{holdQty(h, tool)}</span>
                <ReceivedBadge h={h} />
                <HeldBadge takenAt={h.taken_at} always />
              </li>
            ))}
          </ul>
        </div>,
        document.body,
      )}
    </>
  );
}

// Yeni depo məsulu: əməkdaş kartı + giriş hesabı bir formada (yalnız admin görür)
function NewKeeperForm({ onDone }: { onDone: () => void }) {
  const [state, action, pending] = useActionState(addStorekeeper, null);
  useOnSuccess(state, onDone, "Depo məsulu əlavə edildi");
  return (
    <ActionForm action={action} className="space-y-3 rounded-xl border border-line p-3">
      <Field label="Soyad və ad">
        <input name="full_name" placeholder="Məmmədov Əli" required autoComplete="off" className="field" />
      </Field>
      <Field label="Telefon">
        <input name="phone" placeholder="+994 50 000 00 00" className="field" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="E-poçt (giriş)">
          <input name="email" type="email" required autoComplete="off" className="field" />
        </Field>
        <Field label="Parol (min. 8)">
          <input name="password" type="password" minLength={8} required autoComplete="new-password" className="field" />
        </Field>
      </div>
      <Buttons pending={pending} label="Yarat" onCancel={onDone} />
    </ActionForm>
  );
}

// Depo məsulları (yalnız admin görür, başlıqdakı ⚙ pəncərəsində): yeni depo məsulu yarat + giriş hesabı aç, mövcud əməkdaşı təyin et, hesabı idarə et.
// Depo məsulu usta paneli ilə daxil olur: orada yalnız ona görünən "Depo" bölməsini idarə edir.
export function StorekeepersCard({ employees, accounts, selfId }: { employees: DepotEmployee[]; accounts: Accounts; selfId: number | null }) {
  const keepers = employees.filter((e) => e.is_storekeeper);
  const [picked, setPicked] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null); // hesabı açıq olan depo məsulu
  // Admin öz kartını dəyişə bilmir (baza qaydası); depo məsulu olanlar siyahıda yoxdur
  const candidates = employees
    .filter((e) => !e.is_storekeeper && e.id !== selfId)
    .map((e) => ({ id: e.id, name: e.full_name, hint: e.is_management ? "rəhbər" : "usta" }));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 max-[380px]:flex-wrap">
        <p className="muted min-w-0 flex-1 text-[13px] max-sm:text-xs max-sm:leading-snug"><span className="max-[380px]:hidden">Depo məsulu da adminlər kimi mədaxil, silinmə yazır və sənədləri təsdiqləyir.</span><span className="min-[381px]:hidden">Adminlər kimi mədaxil, silinmə yazır, sənədləri təsdiqləyir.</span></p>
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className="btn btn-primary btn-sm shrink-0"><UserPlus size={14} /> Yeni</button>
        )}
      </div>

      {adding && <NewKeeperForm onDone={() => setAdding(false)} />}

      {keepers.length === 0 ? (
        <p className="muted rounded-xl bg-bg px-3 py-3 text-sm">Təyin olunmayıb. Hələlik depoda dəyişikliyi adminlər edir.</p>
      ) : (
        <ul className="space-y-1.5">
          {keepers.map((e) => {
            const email = accounts.emails[e.id] ?? null;
            return (
              <li key={e.id} className="rounded-xl bg-bg px-2.5 py-2">
                <div className="flex items-center gap-2.5">
                  <Avatar employee={e} className="!h-8 !w-8 !text-[11px]" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{e.full_name}</span>
                    {/* Hesabı olmayan depo məsulu panelə daxil ola bilmir */}
                    {e.user_id
                      ? <span className="muted block truncate text-[11px]">{email ?? "Giriş hesabı var"}</span>
                      : <span className="block text-[11px] font-semibold text-danger">Giriş hesabı yoxdur</span>}
                  </span>
                  <button type="button" onClick={() => setOpenId(openId === e.id ? null : e.id)} aria-expanded={openId === e.id}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted hover:bg-primary-soft hover:text-primary" title="Giriş hesabı">
                    <KeyRound size={14} />
                  </button>
                  <ConfirmButton onConfirm={() => setStorekeeper(e.id, false)} success={false}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted hover:bg-danger-soft hover:text-danger"
                    title="Depo məsulluğunu götür" question={`${e.full_name} artıq depoda dəyişiklik edə bilməyəcək. Əməkdaş kartı və hesabı silinmir.`} confirmLabel="Bəli, götür">
                    <X size={14} />
                  </ConfirmButton>
                </div>
                {openId === e.id && (
                  <div className="mt-2">
                    <AccountSection employeeId={e.id} email={email} hasAccount={!!e.user_id} enabled={accounts.enabled}
                      note="Hesabla depo məsulu usta panelinə daxil olub Depo bölməsini idarə edir." />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex gap-2">
        <ToolPicker items={candidates} value={picked} onChange={setPicked} name="employee_id" icon={Users}
          placeholder="Əməkdaş seç..." emptyLabel="Seçiləcək əməkdaş yoxdur" searchLabel="Əməkdaş axtar..." />
        <button type="button" disabled={!picked} className="btn btn-primary btn-sm !h-9"
          onClick={async () => { if (picked) { await setStorekeeper(picked, true); setPicked(null); } }}>
          Təyin et
        </button>
      </div>
    </div>
  );
}

// Başlıqdakı ⚙ → depo məsulu pəncərəsi (yalnız admin)
export function KeeperModal({ employees, accounts, selfId, onClose }: { employees: DepotEmployee[]; accounts: Accounts; selfId: number | null; onClose: () => void }) {
  return (
    <Modal onClose={onClose} labelledBy="keeper-title" className="!max-w-md">
      <DHead id="keeper-title" icon={ShieldCheck} tone="violet" title="Depo məsulu" sub="Yalnız adminə görünür" onClose={onClose} />
      <StorekeepersCard employees={employees} accounts={accounts} selfId={selfId} />
    </Modal>
  );
}

// toolName verilirsə: usta pəncərəsində (sətirdə usta yox, alətin adı göstərilir).
// Alət: "Geri al" (ustada 1 ədəddirsə dərhal, çoxdursa neçə ədəd olduğu soruşulur).
// Material: "Təhvil al": usta nə qədər qaytarır (kq və ya balon) və qalanı işlədib, ya da ustada qalır.
// Qaz: 1 balon (11,3 kq) götürüb 3 kq işlədib → "Qaytarır 8,3 kq", "Qalanı: işlədib" → 3 kq sərf, 8,3 kq açıq balon depoya.
// Depo məsulu özü qəbul edir (o, qəbul edəndir); ustanın öz qaytarma sorğusu "Təsdiq gözləyir" blokundadır.
function HolderRow({ holding, canManage, tool, toolName, pendingReturn }: {
  holding: Holding; canManage: boolean; tool: Tool | undefined; toolName?: string; pendingReturn: boolean;
}) {
  const unit = tool?.kind === "material" ? tool.unit : "ədəd";
  const material = tool?.kind === "material";
  const pack: PackInfo | null = tool ?? null;
  const packed = isPacked(pack);
  const [asking, setAsking] = useState(false);
  const [writeoff, setWriteoff] = useState(false);
  const [retText, setRetText] = useState("");
  const [byPack, setByPack] = useState(false);
  const [restUsed, setRestUsed] = useState(true); // qalanı işlədib (true) və ya ustada qalır (false)
  const typed = parseQty(retText);
  const retBase = round2((Number.isNaN(typed) ? 0 : typed) * (packed && byPack ? pack.pack_size : 1));
  const rest = round2(holding.quantity - retBase);
  const usedBase = restUsed ? Math.max(0, rest) : 0;
  const invalid = retBase < 0 || rest < 0;
  const empty = retBase === 0 && usedBase === 0;
  const logged = useLoggedUse(holding.employee_id, holding.tool_id, holding.taken_at, material && asking);
  const [state, action, pending] = useActionState(
    async (_prev: Awaited<ReturnType<typeof returnTool>>, fd: FormData) => {
      if (material) return settleMaterial(holding.id, usedBase, retBase);
      const qty = Number(fd.get("quantity") ?? holding.quantity);
      if (qty > holding.quantity) return { error: `Ustada cəmi ${holding.quantity} ${unit} var.` };
      return returnTool(holding.id, qty);
    },
    null,
  );
  const resetForm = () => { setAsking(false); setRetText(""); setByPack(false); setRestUsed(true); };
  useOnSuccess(state, resetForm, material ? "Təhvil alındı" : "Geri alındı");

  // Depoya nə qayıdır: qablıda tam balonlar + açıq balon, boruda ≤ 3 metr parça
  const openPart = packed ? round2(retBase - Math.floor(round2(retBase / pack.pack_size)) * pack.pack_size) : 0;
  const retNote = packed ? (openPart > 0 ? ` (${fmt(openPart)} ${unit} ${pieceWord(pack)})` : "")
    : unit.trim().toLowerCase() === "metr" ? (retBase <= PIECE_MAX ? " (parça)" : "") : "";
  const hint = invalid ? `Ustada cəmi ${showQty(holding.quantity, unit, pack)} var.`
    : empty ? "Nə qədər qaytardığını yaz."
    : [
      usedBase > 0 && `işlədib ${fmt(usedBase)} ${unit}`,
      retBase > 0 && `depoya ${fmt(retBase)} ${unit}${retNote}`,
      !restUsed && rest > 0 && `ustada qalır ${fmt(rest)} ${unit}`,
    ].filter(Boolean).join(" · ");

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
            <Avatar employee={{ full_name: holding.employees?.full_name ?? "?", photo_url: holding.employees?.photo_url ?? null }} className="!h-8 !w-8 !text-[11px]" />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{holding.employees?.full_name ?? "—"}</span>
          </>
        )}
        <ReceivedBadge h={holding} />
        {pendingReturn && <span className="shrink-0 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary" title="Usta qaytarmaq istəyir: Təsdiq gözləyir blokunda">qaytarır</span>}
        <HeldBadge takenAt={holding.taken_at} always />
        <span className="text-sm font-bold tabular-nums text-primary">{showQty(holding.quantity, unit, pack)}</span>
        {canManage && material && !asking && (
          <button type="button" onClick={() => setAsking(true)} className="btn btn-secondary btn-sm !h-8">Təhvil al</button>
        )}
        {canManage && !material && (
          <ActionForm action={action} className="flex items-center gap-1.5">
            {asking && (
              <QuantityInput limit={holding.quantity} defaultValue={holding.quantity} className="!h-8 !w-16"
                limitText={(limit) => `Ustada cəmi ${limit} ${unit} var.`} />
            )}
            {holding.quantity > 1 && !asking ? (
              <button type="button" onClick={() => setAsking(true)} className="btn btn-secondary btn-sm !h-8">Geri al</button>
            ) : (
              <button type="submit" disabled={pending} className="btn btn-secondary btn-sm !h-8">{pending ? "..." : "Geri al"}</button>
            )}
          </ActionForm>
        )}
        {canManage && tool && (
          <button type="button" onClick={() => setWriteoff(true)} className="icon-btn icon-btn-danger !h-8 !w-8" title="Silinmə aktı (itib, xarab)" aria-label="Silinmə aktı">
            <Trash2 size={14} />
          </button>
        )}
      </div>
      {canManage && material && asking && (
        <ActionForm action={action} className="mt-2 rounded-xl bg-bg p-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <label className="flex items-center gap-2">
              <span className="text-sm font-semibold">Qaytarır</span>
              <input value={retText} onChange={(e) => setRetText(e.target.value)} inputMode="decimal" placeholder="0" autoFocus autoComplete="off"
                aria-invalid={invalid} className={`field !h-8 !w-20 !px-2 !text-[13px] ${invalid ? "!border-danger" : ""}`} />
              {packed ? (
                <MiniSeg value={byPack} onChange={setByPack} items={[[false, unit], [true, pack.pack_name]]} label="Vahid" />
              ) : (
                <span className="muted text-sm">{unit}</span>
              )}
            </label>
            <span className="flex items-center gap-2">
              <span className="text-sm font-semibold">Qalanı</span>
              <MiniSeg value={restUsed} onChange={setRestUsed} items={[[true, "işlədib"], [false, "ustada qalır"]]} label="Qalanı" />
            </span>
          </div>
          {/* Usta iş qeydlərində nə qədər işlətdiyini yazıb: müqayisə üçün */}
          {logged !== null && logged > 0 && (
            <p className={`mt-2 text-xs font-semibold ${round2(logged) === usedBase ? "text-ok" : "text-[#b45309]"}`}>İş qeydlərində: {fmt(logged)} {unit}</p>
          )}
          <div className="mt-3 flex items-center gap-2">
            <p className={`min-w-0 flex-1 text-xs ${invalid ? "font-semibold text-danger" : "muted"}`}>{hint}</p>
            <button type="submit" disabled={pending || invalid || empty} className="btn btn-primary btn-sm !h-8">{pending ? "..." : "Təhvil al"}</button>
            <button type="button" onClick={resetForm} className="btn btn-cancel btn-sm !h-8">Ləğv</button>
          </div>
        </ActionForm>
      )}
    </li>
  );
}

// Kiçik keçid (kq | balon, işlədib | ustada qalır)
function MiniSeg<T extends string | boolean>({ value, onChange, items, label }: { value: T; onChange: (v: T) => void; items: [T, string][]; label: string }) {
  return (
    <span className="inline-flex shrink-0 gap-0.5 rounded-lg bg-line/60 p-0.5" role="tablist" aria-label={label}>
      {items.map(([v, l]) => (
        <button key={String(v)} type="button" role="tab" aria-selected={value === v} onClick={() => onChange(v)}
          className={`h-7 rounded-md px-2.5 text-xs font-semibold transition-colors ${value === v ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
          {l}
        </button>
      ))}
    </span>
  );
}

// Siyahıdakı sətirdən sürətli "Ver": alətin pəncərəsini açmadan usta seç, say yaz, ver
export function QuickGiveModal({ tool, employees, onClose }: { tool: Tool; employees: DepotEmployee[]; onClose: () => void }) {
  return (
    <Modal onClose={onClose} labelledBy="quick-give-title" className="!max-w-md">
      <DHead id="quick-give-title" icon={Send} tone="blue" title={`Ver: ${tool.name}`} sub={<>Depoda <b className="text-ok">{withUnit(tool.available, tool)}</b></>} onClose={onClose} />
      <GiveForm tool={tool} employees={employees} onDone={onClose} />
    </Modal>
  );
}

// Bir ustaya bir neçə alət/material birdən: siyahıdan seç, hər birinin sayını yaz, bir düymə ilə ver
export function BulkGiveModal({ emp, kind, tools, onClose }: { emp: DepotEmployee; kind: Kind; tools: Tool[]; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [qty, setQty] = useState<Record<number, string>>({}); // seçilənlər: id → yazılan say (mətn: sahəni tam silib yenidən yazmaq olsun)
  const num = (id: number) => parseQty(qty[id] ?? "");
  const [pending, setPending] = useState(false);
  const available = useMemo(() => tools.filter((t) => t.available > 0), [tools]);
  const shown = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    return available.filter((t) => words.every((w) => norm(`${t.name} ${t.inventory_code}`).includes(w)));
  }, [available, query]);
  const chosen = available.filter((t) => qty[t.id] !== undefined);
  const okQty = (t: Tool) => num(t.id) > 0 && num(t.id) <= t.available && (t.kind === "material" || Number.isInteger(num(t.id)));
  const valid = chosen.length > 0 && chosen.every(okQty);

  const toggle = (t: Tool) => setQty((q) => {
    const next = { ...q };
    if (next[t.id] === undefined) next[t.id] = "1"; else delete next[t.id];
    return next;
  });

  async function give() {
    if (!valid) return;
    setPending(true);
    const r = await giveTools(emp.id, chosen.map((t) => ({ toolId: t.id, name: t.name, quantity: round2(num(t.id)) })));
    setPending(false);
    if (r?.error) return toast.error(r.error);
    toast.success(`${chosen.length} ${TEXT[kind].word} verildi`);
    onClose();
  }

  return (
    <Modal onClose={onClose} labelledBy="bulk-give-title" className="!max-w-lg">
      <DHead id="bulk-give-title" icon={Send} tone="blue" title={`${emp.full_name}: ${TEXT[kind].word} ver`} sub="İşarələ, sayını yaz, birdən ver" onClose={onClose} />

      <div className="search">
        <Search size={16} className="!left-4" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={TEXT[kind].search.split(" və ")[0] + " axtar..."} aria-label="Axtarış" autoFocus
          className="!h-10 !pl-10 !text-sm" />
      </div>

      {available.length === 0 ? (
        <p className="muted py-6 text-center text-sm">Depoda verilə bilən boş {TEXT[kind].word} yoxdur.</p>
      ) : (
        <ul className="nice-scroll mt-3 max-h-[min(360px,calc(100vh/var(--zoom)-340px))] divide-y divide-line overflow-y-auto">
          {shown.map((t) => {
            const on = qty[t.id] !== undefined;
            return (
              <li key={t.id} className="flex items-center gap-3 py-2">
                <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                  <input type="checkbox" checked={on} onChange={() => toggle(t)} className="h-4 w-4 shrink-0 accent-[var(--color-primary)]" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{t.name}</span>
                    <span className="muted block text-[11px]">depoda {withUnit(t.available, t)}</span>
                  </span>
                </label>
                {on && (
                  <span className="flex shrink-0 items-center gap-1.5">
                    <input inputMode="decimal" autoComplete="off" value={qty[t.id]} aria-label={`${t.name} sayı`}
                      onChange={(e) => setQty((q) => ({ ...q, [t.id]: e.target.value }))}
                      className={`field !h-8 !w-20 !px-2 !text-[13px] ${okQty(t) ? "" : "!border-danger"}`} />
                    <span className="muted text-xs">{t.kind === "material" ? t.unit : "ədəd"}</span>
                  </span>
                )}
              </li>
            );
          })}
          {shown.length === 0 && <li className="muted py-6 text-center text-sm">Heç nə tapılmadı.</li>}
        </ul>
      )}

      <div className="mt-4 flex gap-2 border-t border-line pt-4">
        <button type="button" disabled={pending || !valid} onClick={give} className="btn btn-primary flex-1">
          {pending ? "Gözləyin..." : chosen.length ? `Seçilənləri ver (${chosen.length})` : `Yuxarıdan ${TEXT[kind].word} seç`}
        </button>
        <button type="button" onClick={onClose} className="btn btn-cancel">Ləğv et</button>
      </div>
    </Modal>
  );
}

// Ustaya ver. Qablı materialda say balonla (standart) və ya kq ilə yazılır; baza həmişə ölçü vahidi ilə işləyir (1 balon → 11,3 kq).
function GiveForm({ tool, employees, onDone }: { tool: Tool; employees: DepotEmployee[]; onDone?: () => void }) {
  const [state, action, pending] = useActionState(giveTool, null);
  const [picked, setPicked] = useState<number | null>(null);
  const [formKey, setFormKey] = useState(0);
  const packed = isPacked(tool);
  const [byPack, setByPack] = useState(packed);
  useOnSuccess(state, () => { setPicked(null); setFormKey((k) => k + 1); onDone?.(); }, "Verildi: usta «Aldım» ilə təsdiqləyəcək");
  // Alət/material yalnız ustaya verilir (rəhbərlik siyahıda yoxdur; bazada da trigger yoxlayır)
  const items = employees.filter((e) => !e.is_management).map((e) => ({ id: e.id, name: e.full_name }));
  const factor = packed && byPack ? tool.pack_size : 1;
  const unitLabel = packed && byPack ? tool.pack_name : tool.kind === "material" ? tool.unit : "ədəd";
  const limit = packed && byPack ? Math.floor(round2(tool.available / factor)) : tool.available;

  // Göndərməzdən əvvəl də yoxla: say depodakından çoxdursa, sorğu getmir, tost çıxır
  function submit(fd: FormData) {
    const wanted = Number(fd.get("quantity"));
    const amount = round2(wanted * factor);
    if (!(amount > 0)) return toast.error("Miqdar 0-dan çox olmalıdır.");
    if (tool.kind === "tool" && !Number.isInteger(amount)) return toast.error("Alətin sayı tam ədəd olmalıdır.");
    if (amount > tool.available) return toast.error(giveLimitText(limit, wanted, unitLabel));
    fd.set("quantity", String(amount));
    action(fd);
  }

  if (!(tool.available > 0)) {
    return <p className="muted py-2 text-center text-sm">Depoda boş qalmayıb.</p>;
  }
  return (
    <ActionForm key={formKey} action={submit} className="flex flex-wrap gap-2">
      <input type="hidden" name="tool_id" value={tool.id} />
      <div className="min-w-[12rem] flex-1">
        <ToolPicker items={items} value={picked} onChange={setPicked} name="employee_id" icon={Users}
          placeholder="Kimə verilir?" emptyLabel="Aktiv əməkdaş yoxdur" searchLabel="Usta axtar..." />
      </div>
      <QuantityInput key={String(byPack)} limit={limit} limitText={(l, w) => giveLimitText(l, w, unitLabel)} />
      {/* Vahid sahənin yanında: balonda keçid, qalanında materialın öz vahidi (metr, kq...) və ya "ədəd" */}
      {packed
        ? <span className="self-center"><MiniSeg value={byPack} onChange={setByPack} items={[[true, tool.pack_name], [false, tool.unit]]} label="Vahid" /></span>
        : <span className="muted self-center text-sm">{unitLabel}</span>}
      <button type="submit" disabled={pending || !picked} className="btn btn-primary btn-sm !h-9">{pending ? "..." : "Ver"}</button>
    </ActionForm>
  );
}

function EditToolModal({ tool, onClose }: { tool: Tool; onClose: () => void }) {
  const [state, action, pending] = useActionState(updateTool.bind(null, tool.id), null);
  useOnSuccess(state, onClose);
  const kind = tool.kind as Kind;

  return (
    <Modal onClose={onClose} labelledBy="edit-tool-title" className="!max-w-md">
      <DHead id="edit-tool-title" icon={Pencil} tone={kind === "material" ? "teal" : "blue"} title={TEXT[kind].editTitle} sub={tool.name} onClose={onClose} />
      <SaveConfirmForm action={action} className="space-y-4">
        <ToolFields t={tool} kind={kind} />
        <Buttons pending={pending} label="Yadda saxla" onCancel={onClose} />
      </SaveConfirmForm>
    </Modal>
  );
}

// Parçanı kimə və nə qədər verəsən: hamısı və ya bir hissəsi (qalan hissə depoda parça kimi qalır).
// Açıq balon bölünmür: bütöv verilir.
function PieceGiveModal({ piece, tool, employees, onClose }: { piece: Piece; tool: Tool; employees: DepotEmployee[]; onClose: () => void }) {
  const unit = tool.unit;
  const whole = isPacked(tool);
  const [picked, setPicked] = useState<number | null>(null);
  const [amount, setAmount] = useState(piece.length);
  const [pending, setPending] = useState(false);
  const items = employees.filter((e) => !e.is_management).map((e) => ({ id: e.id, name: e.full_name }));
  const valid = !!picked && amount > 0 && amount <= piece.length;
  const rest = round2(piece.length - amount);

  async function give() {
    if (!valid || !picked) return;
    setPending(true);
    const r = await givePiece(piece.id, picked, whole ? undefined : round2(amount));
    setPending(false);
    if (r?.error) return toast.error(r.error);
    toast.success("Verildi");
    onClose();
  }

  return (
    <Modal onClose={onClose} labelledBy="piece-give-title" className="!max-w-md">
      <DHead id="piece-give-title" icon={PackageOpen} tone="violet" title={tool.name} sub={`${pieceWord(tool)}: ${fmt(piece.length)} ${unit}`} onClose={onClose} />
      {!whole && (
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm font-semibold">Nə qədər</span>
          <QuantityInput limit={piece.length} defaultValue={piece.length} className="!w-20" onValue={setAmount}
            limitText={(limit) => `Parçada cəmi ${fmt(limit)} ${unit} var.`} />
          <span className="muted text-sm">{unit}{valid && rest > 0 ? ` · ${fmt(rest)} ${unit} depoda qalır` : ""}</span>
        </div>
      )}
      <div className="flex gap-2">
        <div className="min-w-0 flex-1">
          <ToolPicker items={items} value={picked} onChange={setPicked} name="employee_id" icon={Users}
            placeholder="Kimə verilir?" emptyLabel="Aktiv əməkdaş yoxdur" searchLabel="Usta axtar..." />
        </div>
        <button type="button" disabled={pending || !valid} onClick={give} className="btn btn-primary btn-sm !h-9">{pending ? "..." : "Ver"}</button>
      </div>
    </Modal>
  );
}

// Depodakı bir parça / açıq balon: nə qədər, kimdən qalıb, nə vaxt; ustaya vermək və ya silinmə aktı (təsdiqdən sonra silinir)
function PieceRow({ piece, tool, employees, canManage, writeoffPending }: { piece: Piece; tool: Tool; employees: DepotEmployee[]; canManage: boolean; writeoffPending: boolean }) {
  const unit = tool.unit;
  const [giving, setGiving] = useState(false);
  const [writeoff, setWriteoff] = useState(false);
  const original = piece.original_length ?? piece.length;
  const who = piece.employees ? `${piece.employees.full_name} qaytarıb` : "Depoda qalan hissə";
  return (
    <li className="flex items-center gap-3 py-2">
      {giving && <PieceGiveModal piece={piece} tool={tool} employees={employees} onClose={() => setGiving(false)} />}
      {writeoff && <WriteoffModal tool={tool} source={{ kind: "piece", piece }} onClose={() => setWriteoff(false)} />}
      {/* Qalan miqdar; hissə verilibsə ilkin miqdar da yazılır */}
      <span className="w-24 shrink-0">
        <span className="block text-sm font-bold tabular-nums">{fmt(piece.length)} {unit}</span>
        {original > piece.length && <span className="muted block text-[11px]">ilkin {fmt(original)}</span>}
      </span>
      <span className="muted min-w-0 flex-1 truncate text-[13px]" title={who}>{who} · {dateAz(piece.created_at)}</span>
      {writeoffPending && <span className="shrink-0 rounded-full bg-danger-soft px-2 py-0.5 text-[11px] font-bold text-danger">silinmə gözləyir</span>}
      {canManage && (
        <>
          <button type="button" onClick={() => setGiving(true)} className="btn btn-secondary btn-sm !h-8">Ver</button>
          {!writeoffPending && (
            <button type="button" onClick={() => setWriteoff(true)} className="icon-btn icon-btn-danger" title="Silinmə aktı (sərf olunub)" aria-label="Silinmə aktı">
              <Trash2 size={15} />
            </button>
          )}
        </>
      )}
    </li>
  );
}

// Təmirdə olan: harada, nə vaxtdan; qayıdanda "Düzəldi" (depoya) və ya "Bərpa olunmadı" (silinmə aktı gözləməyə düşür)
function RepairRow({ r, unit, canManage }: { r: Repair; unit: string; canManage: boolean }) {
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
          <button type="button" disabled={pending} onClick={() => finish(true)} className="btn btn-secondary btn-sm !h-8">Düzəldi</button>
          <ConfirmButton onConfirm={() => finish(false)} success={false} className="btn btn-cancel btn-sm !h-8" title="Bərpa olunmadı"
            question="Depoya qayıdır və silinmə aktı (xarab) yazılır; başqası təsdiqləyəndə depodan silinir." confirmLabel="Bəli">
            Bərpa olunmadı
          </ConfirmButton>
        </span>
      )}
    </li>
  );
}

// Alətin / materialın pəncərəsi (2026-10-23 yeni dizayn): başlıq (rəngli ikon, ad, ölçü; redaktə, sil), 3 göstərici,
// "Ustaya ver" kartı, əməliyyat kafelləri (Mədaxil, Silinmə, Təmirə, Hərəkətlər), Kimdədir, Təmirdə, Açıq balonlar / Parçalar.
export function ToolModal({ tool, holders, pieces, repairs, losses = [], requests, employees, canManage, onReceipt, onClose }: {
  tool: Tool;
  holders: Holding[];
  pieces: Piece[];
  repairs: Repair[];
  losses?: Loss[];
  requests: DepotRequest[];
  employees: DepotEmployee[];
  canManage: boolean;
  onReceipt: () => void;
  onClose: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [doc, setDoc] = useState<"writeoff" | "repair" | "history" | null>(null);
  const kind = tool.kind as Kind;
  const material = kind === "material";
  const empty = tool.quantity === 0 && tool.pieces_total === 0 && holders.length === 0;
  const pendingPieces = new Set(requests.filter((r) => r.type === "writeoff" && r.piece_id).map((r) => r.piece_id!));
  const pendingReturns = new Set(requests.filter((r) => r.type === "return" && r.assignment_id).map((r) => r.assignment_id!));
  const measure = !material ? "Alət · ədəd" : isPacked(tool) ? `Material · 1 ${tool.pack_name} = ${fmt(tool.pack_size)} ${tool.unit}` : `Material · ${tool.unit}`;
  const piecesTitle = !isPacked(tool) ? "Parçalar" : tool.pack_name === "balon" ? "Açıq balonlar" : "Açıq qablar";
  const actions = [
    canManage && { icon: PackagePlus, tone: "green" as const, label: "Mədaxil", onClick: onReceipt },
    canManage && { icon: Trash2, tone: "red" as const, label: "Silinmə", onClick: () => setDoc("writeoff") },
    canManage && !material && { icon: Wrench, tone: "amber" as const, label: "Təmirə", onClick: () => setDoc("repair") },
    { icon: History, tone: "slate" as const, label: "Hərəkətlər", onClick: () => setDoc("history") },
  ].filter((a) => !!a);

  return (
    <Modal onClose={onClose} labelledBy={`tool-${tool.id}-title`} className="!max-w-2xl">
      {editing && <EditToolModal tool={tool} onClose={() => setEditing(false)} />}
      {doc === "writeoff" && <WriteoffModal tool={tool} source={{ kind: "depot" }} onClose={() => setDoc(null)} />}
      {doc === "repair" && <RepairModal tool={tool} onClose={() => setDoc(null)} />}
      {doc === "history" && <HistoryModal kind={kind} toolId={tool.id} toolName={tool.name} onClose={() => setDoc(null)} />}
      <DHead id={`tool-${tool.id}-title`} icon={material ? Package : Wrench} tone={material ? "teal" : "blue"} title={tool.name} sub={measure} onClose={onClose}>
        {canManage && (
          <>
            <button type="button" onClick={() => setEditing(true)} className="icon-btn" title="Redaktə et" aria-label="Redaktə et"><Pencil size={16} /></button>
            {/* Silmək yalnız boş olanda: qalıq Silinmə aktı ilə sıfırlanır, ustadakı geri alınır */}
            {empty ? (
              <ConfirmButton onConfirm={() => deleteTool(tool.id, kind)} success={false} className="icon-btn icon-btn-danger" title={TEXT[kind].deleteTitle}>
                <Trash2 size={16} />
              </ConfirmButton>
            ) : (
              <button type="button" className="icon-btn" title={TEXT[kind].deleteTitle} aria-label={TEXT[kind].deleteTitle}
                onClick={() => toast.error(holders.length
                  ? `Ustalarda ${withUnit(tool.given_out, tool)} var: əvvəl geri alın.`
                  : "Depoda qalıq var: silmək üçün əvvəl «Silinmə aktı» ilə sıfırla.")}>
                <Trash2 size={16} />
              </button>
            )}
          </>
        )}
      </DHead>

      <div className="grid grid-cols-3 gap-2.5">
        <DStat icon={Warehouse} tone={tool.available > 0 ? "green" : "red"} label="Depoda" value={withUnit(tool.available, tool)} />
        <DStat icon={Users} tone="blue" label="Ustalarda" value={withUnit(tool.given_out, tool)} hint={holders.length ? `${holders.length} usta` : "heç kimdə"} />
        {material
          ? <DStat icon={PackageOpen} tone="violet" label={piecesTitle} value={tool.pieces_count ? `${fmt(tool.pieces_total)} ${tool.unit}` : "—"} hint={tool.pieces_count ? `${tool.pieces_count} ədəd` : undefined} />
          : <DStat icon={Wrench} tone="amber" label="Təmirdə" value={String(tool.in_repair)} />}
      </div>

      {/* Silinənlər: neçə ədəd, hansı səbəblə, nə vaxt (təsdiqlənmiş silinmə aktları) */}
      {losses.length > 0 && (
        <div className="mt-3 rounded-2xl border border-[#fecaca] bg-[#fff5f5] px-4 py-3">
          <p className="mb-1.5 flex items-center gap-2 text-sm font-bold text-[#b91c1c]"><Trash2 size={15} /> Silinib</p>
          <ul className="space-y-1 text-[13px]">
            {losses.map((l, i) => (
              <li key={i} className="flex items-center gap-2">
                <b className="tabular-nums">{fmt(l.quantity ?? 0)} {material ? tool.unit : "ədəd"}</b>
                <span className="text-ink/80">{l.reason === "other" ? l.note ?? "başqa səbəb" : (REASONS[l.reason ?? "other"] ?? "").toLocaleLowerCase("az")}</span>
                {l.reason !== "other" && l.note && <span className="muted truncate">· {l.note}</span>}
                {l.decided_at && <span className="muted ml-auto shrink-0 text-xs">{dateAz(l.decided_at)}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {canManage && (
        <div className="mt-4 rounded-2xl border border-[#dbe7ff] bg-[linear-gradient(135deg,#f4f8ff,#ffffff)] p-4">
          <p className="mb-2.5 flex items-center gap-2 text-sm font-bold"><Send size={15} className="text-primary" /> Ustaya ver</p>
          <GiveForm tool={tool} employees={employees} />
        </div>
      )}

      <div className={`mt-3 grid gap-2 ${actions.length === 4 ? "grid-cols-4" : actions.length === 3 ? "grid-cols-3" : "grid-cols-1"}`}>
        {actions.map((a) => <DAction key={a.label} icon={a.icon} tone={a.tone} label={a.label} onClick={a.onClick} />)}
      </div>

      <DSection title="Kimdədir" count={holders.length}>
        {holders.length === 0 ? (
          <p className="muted rounded-2xl border border-dashed border-line py-4 text-center text-sm">Heç kimdə deyil</p>
        ) : (
          <ul className="nice-scroll max-h-72 divide-y divide-line overflow-y-auto rounded-2xl border border-line px-3">
            {holders.map((h) => <HolderRow key={h.id} holding={h} canManage={canManage} tool={tool} pendingReturn={pendingReturns.has(h.id)} />)}
          </ul>
        )}
      </DSection>

      {repairs.length > 0 && (
        <DSection title="Təmirdə" count={repairs.reduce((n, r) => n + r.quantity, 0)}>
          <ul className="divide-y divide-line rounded-2xl border border-line px-3">
            {repairs.map((r) => <RepairRow key={r.id} r={r} unit={material ? tool.unit : "ədəd"} canManage={canManage} />)}
          </ul>
        </DSection>
      )}

      {material && pieces.length > 0 && (
        <DSection title={piecesTitle} count={pieces.length}>
          <ul className="nice-scroll max-h-[210px] divide-y divide-line overflow-y-auto rounded-2xl border border-line px-3">
            {pieces.map((p) => <PieceRow key={p.id} piece={p} tool={tool} employees={employees} canManage={canManage} writeoffPending={pendingPieces.has(p.id)} />)}
          </ul>
        </DSection>
      )}
    </Modal>
  );
}

// Ustanın pəncərəsi (2026-10-23 yeni dizayn): bənövşəyi başlıq (şəkil, ad, vəzifə), 3 göstərici, Alətlər | Materiallar tabı,
// əməliyyatlar (ver, hamısını geri al), haşiyəli siyahı (geri al / təhvil al / silinmə aktı)
export function PersonModal({ emp, kind: initialKind, holds: allHolds, toolInfo, tools: allTools, requests, canManage, onClose }: {
  emp: DepotEmployee;
  kind: Kind;
  holds: Holding[];
  toolInfo: Map<number, Tool>;
  tools: Tool[];
  requests: DepotRequest[];
  canManage: boolean;
  onClose: () => void;
}) {
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
      <div className="-mx-6 -mt-6 max-sm:-mx-4 max-sm:-mt-5 mb-5 overflow-hidden rounded-t-[18px] bg-[linear-gradient(135deg,#7c3aed,#4f46e5_60%,#2563eb)] px-6 max-sm:px-4 pb-5 pt-5 text-white">
        <div className="flex items-start gap-4">
          <Avatar employee={emp} className="!h-14 !w-14 !text-base ring-4 ring-white/25" />
          <div className="min-w-0 flex-1 pt-1">
            <h2 id={`emp-${emp.id}-title`} className="truncate text-xl font-bold leading-tight">{emp.full_name}</h2>
            <p className="truncate text-[13px] text-white/70">{emp.position ?? "Usta"}</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20" aria-label="Bağla"><X size={18} /></button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {([["Alət", `${toolsN} ədəd`], ["Material", `${matsN} növ`], ["«Aldım» gözləyir", String(waiting)]] as const).map(([l, v]) => (
            <div key={l} className="rounded-2xl bg-white/12 px-3.5 py-2.5 backdrop-blur-sm">
              <p className="text-[11px] font-semibold text-white/65">{l}</p>
              <p className="text-lg font-extrabold tabular-nums">{v}</p>
            </div>
          ))}
        </div>
      </div>

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
            <button type="button" onClick={() => setGiving(true)} className="btn btn-primary btn-sm !h-9">
              <Plus size={14} /> {kind === "tool" ? "Alət ver" : "Material ver"}
            </button>
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
