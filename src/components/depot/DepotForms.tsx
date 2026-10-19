
import { urlQuery } from "@/lib/urlQuery";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, History, KeyRound, Pencil, Plus, Search, ShieldCheck, Trash2, Undo2, UserPlus, Users, Warehouse, Wrench, X } from "lucide-react";
import { addStorekeeper, addTool, deleteTool, discardPiece, givePiece, giveTool, giveTools, returnAllTools, returnTool, setStorekeeper, settleMaterial, updateTool } from "@/actions/tools";
import { ConfirmButton } from "@/components/ConfirmButton";
import { HistoryModal } from "@/components/depot/HistoryModal";
import { AccountSection, Avatar, type Accounts } from "@/components/employees/EmployeeForms";
import { ActionForm, Buttons, Field, SaveConfirmForm, useOnSuccess } from "@/components/forms";
import { Modal, useEscapeLayer } from "@/components/Modal";
import { giveLimitText, QuantityInput } from "@/components/QuantityInput";
import { ToolPicker } from "@/components/ToolPicker";
import { UnitSelect } from "@/components/UnitSelect";
import type { Tables } from "@/lib/database.types";
import { toast } from "@/lib/toast";

export type Tool = Tables<"tool_stock">;
// Depoda iki növ var: alət və material (mis boru, qaz balonu...). Eyni cədvəl, eyni qaydalar; material ölçü vahidi ilə (metr, kq...).
export type Kind = "tool" | "material";
// Ustada hazırda olan alət/material (açıq təhvil)
export type Holding = {
  id: number;
  tool_id: number;
  employee_id: number;
  quantity: number;
  taken_at: string;
  employees: { full_name: string; photo_url: string | null } | null;
};
// Depoda qalan material parçası (usta işlədib, qalanını təhvil verib): ayrı-ayrı göstərilir
// length: depoda qalan uzunluq; original_length: usta ilkin nə qədər qaytarıb (parçadan hissə veriləndə length azalır, original qalır)
export type Piece = { id: number; tool_id: number; length: number; original_length: number | null; created_at: string; employees: { full_name: string } | null };
export type DepotEmployee = Pick<Tables<"employees">, "id" | "full_name" | "photo_url" | "position" | "is_management" | "is_storekeeper" | "user_id">;

// Hər növün mətnləri
const TEXT: Record<Kind, {
  tab: string; col: string; newTitle: string; addLabel: string; added: string; editTitle: string; deleteTitle: string;
  qty: string; placeholder: string; search: string; empty: string; hint: string; peopleCol: string;
}> = {
  tool: {
    tab: "Alətlər", col: "Alət", newTitle: "Yeni alət", addLabel: "Aləti əlavə et", added: "Alət əlavə edildi", editTitle: "Aləti redaktə et",
    deleteTitle: "Aləti sil", qty: "Say", placeholder: "Vakuum nasos", search: "Alət və ya usta axtar...",
    empty: "Hələ alət yoxdur", hint: "Üzərindəki alətlər", peopleCol: "Ədəd",
  },
  material: {
    tab: "Materiallar", col: "Material", newTitle: "Yeni material", addLabel: "Materialı əlavə et", added: "Material əlavə edildi", editTitle: "Materialı redaktə et",
    deleteTitle: "Materialı sil", qty: "Miqdar", placeholder: "Mis boru 3/8", search: "Material və ya usta axtar...",
    empty: "Hələ material yoxdur", hint: "Üzərindəki materiallar", peopleCol: "Növ",
  },
};
const UNITS = ["ədəd", "metr", "kq", "litr", "rulon", "bağlama"];

// Qablı materialda (balon...) tam qabların sayı mötərizədə: "44 kq (4 balon)"
type PackInfo = { pack_name: string | null; pack_size: number | null };
const packSuffix = (n: number, p: PackInfo) => (p.pack_size && p.pack_name && n > 0 && n % p.pack_size === 0 ? ` (${n / p.pack_size} ${p.pack_name})` : "");
// "12 metr" / "44 kq (4 balon)" (material) | "12" (alət)
const withUnit = (n: number, t: Pick<Tool, "kind" | "unit" | "pack_name" | "pack_size">) => (t.kind === "material" ? `${n} ${t.unit}${packSuffix(n, t)}` : String(n));
// Ustada olan miqdar: "11 kq (1 balon)"
// Boru (metr): bu qədər və ya az qaytarılan hissə parça olur, çoxu tam boruya qatılır (bazada settle_material ilə eyni hədd)
const PIECE_MAX = 3;
const showQty = (n: number, unit: string, p?: PackInfo | null) => `${n} ${unit}${p ? packSuffix(n, p) : ""}`;

// Axtarış üçün sadələşdirmə: "Əlizadə" və "elizade" eyni tapılsın.
function norm(s: string | null | undefined) {
  return (s ?? "")
    .toLowerCase()
    .replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g");
}

// Ustada nə qədərdir: bu qədər gündən çox qalan alət xəbərdarlıq rəngində göstərilir
const STALE_DAYS = 14;
// max(0): kompüterin saatı bazadan bir neçə saniyə geri qalanda yeni götürülən "-1 gün" göstərməsin
const daysSince = (iso: string) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));

function HeldBadge({ takenAt, always = false }: { takenAt: string; always?: boolean }) {
  const d = daysSince(takenAt);
  const stale = d >= STALE_DAYS;
  if (!stale && !always) return null;
  const date = takenAt.slice(0, 10).split("-").reverse().join(".");
  return (
    <span title={`Götürüb: ${date}`} className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${stale ? "bg-[#fff4e0] text-[#b45309]" : "muted"}`}>
      {d === 0 ? "bu gün" : `${d} gün`}
    </span>
  );
}

// Bir ustadakı say: "×2" (alət) | "5 metr" (material)
function holdQty(h: Holding, t: Tool) {
  return t.kind === "material" ? `${h.quantity} ${t.unit}` : h.quantity > 1 ? `×${h.quantity}` : "";
}

// Siyahıda "Kimdədir": həmişə "N usta" düyməsi (1 usta olsa da), basanda ad siyahısı açılır
// (10 adı sətirə sığdırmaq olmur). Siyahı cədvəlin sürüşməsindən kəsilməsin deyə body-də açılır.
function HoldersCell({ holders, tool }: { holders: Holding[]; tool: Tool }) {
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
  return (
    <>
      <span className="flex items-center gap-2">
        <button ref={btn} type="button" aria-expanded={pos !== null} aria-haspopup="true"
          onClick={(e) => {
            e.stopPropagation();
            if (pos) return setPos(null);
            const r = e.currentTarget.getBoundingClientRect();
            setPos({ top: r.bottom + 6, left: Math.min(r.left, window.innerWidth - 304) });
          }}
          className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-primary-soft px-2.5 text-[13px] font-semibold text-primary transition-colors hover:bg-[#dbe8ff]">
          {holders.length} usta <ChevronDown size={13} className={pos ? "rotate-180" : ""} />
        </button>
        {oldest && <HeldBadge takenAt={oldest.taken_at} />}
      </span>
      {pos && createPortal(
        <div data-holders-pop style={{ top: pos.top, left: pos.left }}
          className="fixed z-50 w-72 rounded-xl border border-line bg-surface p-1.5 shadow-[0_16px_40px_rgba(16,24,40,0.18)]">
          <ul className="nice-scroll max-h-64 overflow-y-auto">
            {holders.map((h) => (
              <li key={h.id} className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px]">
                <span className="min-w-0 flex-1 truncate font-semibold">{h.employees?.full_name ?? "?"}</span>
                <span className="tabular-nums text-primary">{holdQty(h, tool)}</span>
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

// Depoda minimum qalıq həddinə çatıb: depodakı tam say (materialda + parçalar) həddə bərabər və ya ondan azdır
export function isLowStock(t: { min_stock: number | null; available: number; pieces_total: number }) {
  return t.min_stock != null && t.available + t.pieces_total <= t.min_stock;
}

// Alət / material əlavə et və redaktə et sahələri. Vahid (ədəd, kq, metr, litr...) açılan siyahıdan seçilir (alət və material üçün).
// Ad: mövcud adlar təklif olunur (eyni material ikinci dəfə yazılmasın; təkrar ad əlavə edəndə də bloklanır).
// Qablaşdırılmış material (qaz balonu...) üçün qab (balon) və hər qabdakı miqdar (11 kq) yazılır: say qabla daxil edilir,
// daxildə ölçü vahidi ilə saxlanır (4 balon × 11 kq = 44 kq). Beləcə usta 1 balon götürüb 5 kq qaytara bilir.
function ToolFields({ t, kind, names = [] }: { t?: Tool; kind: Kind; names?: string[] }) {
  const tx = TEXT[kind];
  const editing = !!t;
  const [countText, setCountText] = useState(String(t?.quantity ?? 1)); // mətn: sahəni silib yenidən yazmaq olsun
  const count = Number(countText);
  const [unit, setUnit] = useState(t?.unit ?? "ədəd");
  const [packName, setPackName] = useState("");
  const [packSize, setPackSize] = useState("");
  const size = Number(packSize);
  const packed = kind === "material" && !editing && packName.trim() !== "" && Number.isInteger(size) && size > 0;
  // Siyahıda olmayan köhnə vahid (məs. "balon", "Metr") itməsin: ayrıca seçim kimi qalır
  const unitOptions = UNITS.includes(unit) ? UNITS : [unit, ...UNITS];

  return (
    <>
      <Field label="Adı">
        <input name="name" defaultValue={t?.name} placeholder={tx.placeholder} required list={editing ? undefined : "depot-names"} autoComplete="off" className="field" />
        {!editing && <datalist id="depot-names">{names.map((n) => <option key={n} value={n} />)}</datalist>}
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={packed ? `Say (${packName.trim()})` : tx.qty}>
          <input name="quantity" type="number" min={0} step={1} value={countText} onChange={(e) => setCountText(e.target.value)} required className="field" />
        </Field>
        <Field label="Vahid">
          <UnitSelect value={unit} onChange={setUnit} options={unitOptions} />
        </Field>
      </div>
      <Field label={`Minimum qalıq (${unit.trim() || "vahid"}, istəyə görə)`}>
        <input name="min_stock" type="number" min={0} step={1} defaultValue={t?.min_stock ?? ""} placeholder="Məs. 2: depoda ≤ 2 qalanda xəbərdarlıq" className="field" />
      </Field>
      {kind === "tool" && (
        <Field label="İnventar kodu">
          <input name="inventory_code" defaultValue={t?.inventory_code ?? ""} placeholder="İstəyə görə" className="field" />
        </Field>
      )}
      {kind === "material" && !editing && (
        <div className="rounded-xl border border-dashed border-line p-3">
          <p className="text-xs font-semibold">Qablaşdırılıbsa (istəyə görə)</p>
          <p className="muted mt-0.5 text-xs">Qaz balonu, kanistr kimi: say qabla yazılır, içindəki miqdar vahidlə (kq, litr). Usta qabdan işlədib qalanını qaytara bilir.</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <Field label="Qabın adı">
              <input name="pack_name" value={packName} onChange={(e) => setPackName(e.target.value)} placeholder="balon" className="field" />
            </Field>
            <Field label={`Hər qabda (${unit.trim() || "vahid"})`}>
              <input name="pack_size" type="number" min={1} step={1} value={packSize} onChange={(e) => setPackSize(e.target.value)} placeholder="11" className="field" />
            </Field>
          </div>
          {packed && (
            <p className="mt-2 text-sm font-semibold">
              Cəmi: {count * size} {unit.trim()} <span className="muted font-medium">({count} {packName.trim()})</span>
            </p>
          )}
        </div>
      )}
    </>
  );
}

// Alət / Material seçimi (iki tab)
export function KindTabs({ kind, onKind }: { kind: Kind; onKind: (k: Kind) => void }) {
  return (
    <div className="inline-flex gap-1 rounded-xl bg-line/60 p-1" role="tablist">
      {(["tool", "material"] as const).map((k) => (
        <button key={k} type="button" role="tab" aria-selected={kind === k} onClick={() => onKind(k)}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${kind === k ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
          {TEXT[k].tab}
        </button>
      ))}
    </div>
  );
}

// Sağ paneldəki "Yeni alət / Yeni material" kartı (yalnız depo məsulu və müdir). Alət və material ayrı əlavə olunur.
export function AddToolCard({ kind, onKind, names }: { kind: Kind; onKind: (k: Kind) => void; names: string[] }) {
  const [state, action, pending] = useActionState(addTool, null);
  const ref = useRef<HTMLFormElement>(null);
  const tx = TEXT[kind];
  const [formKey, setFormKey] = useState(0); // forma təzələnir (qab sahələri də sıfırlanır)
  useOnSuccess(state, () => { ref.current?.reset(); setFormKey((k) => k + 1); }, tx.added);

  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-3">
        <span className="icon-tile !h-9 !w-9"><Plus size={18} /></span>
        <h2 className="card-title">{tx.newTitle}</h2>
      </div>
      <KindTabs kind={kind} onKind={onKind} />
      {/* key: növ dəyişəndə forma təzələnir (köhnə yazılar qalmasın) */}
      <ActionForm key={`${kind}-${formKey}`} ref={ref} action={action} className="space-y-4">
        <input type="hidden" name="kind" value={kind} />
        <ToolFields kind={kind} names={names} />
        <Buttons pending={pending} label={tx.addLabel} />
      </ActionForm>
    </div>
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
        <Field label="Parol (ən azı 8)">
          <input name="password" type="password" minLength={8} required autoComplete="new-password" className="field" />
        </Field>
      </div>
      <Buttons pending={pending} label="Depo məsulunu yarat" onCancel={onDone} />
    </ActionForm>
  );
}

// Depo məsulları (yalnız admin görür): yeni depo məsulu yarat + giriş hesabı aç, mövcud əməkdaşı təyin et, hesabı idarə et.
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
    <div className="card space-y-3">
      <div className="flex items-center gap-3">
        <span className="icon-tile !h-9 !w-9"><ShieldCheck size={18} /></span>
        <div className="min-w-0 flex-1">
          <h2 className="card-title">Depo məsulu</h2>
          <p className="muted text-xs">Yalnız adminə görünür</p>
        </div>
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className="btn btn-primary btn-sm"><UserPlus size={14} /> Yeni</button>
        )}
      </div>

      {adding && <NewKeeperForm onDone={() => setAdding(false)} />}

      {keepers.length === 0 ? (
        <p className="muted text-sm">Təyin olunmayıb. Hələlik depoda dəyişikliyi yalnız müdir edir.</p>
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
          placeholder="Mövcud əməkdaşı seç..." emptyLabel="Seçiləcək əməkdaş yoxdur" searchLabel="Əməkdaş axtar..." />
        <button type="button" disabled={!picked} className="btn btn-primary btn-sm !h-9"
          onClick={async () => { if (picked) { await setStorekeeper(picked, true); setPicked(null); } }}>
          Təyin et
        </button>
      </div>
    </div>
  );
}

// Depo: iki tab (Alətlər / Materiallar); hər birində siyahı və "Ustalar üzrə" görünüşü.
export function ToolList({ kind, onKind, tools: allTools, holdings: allHoldings, pieces, employees, canManage }: {
  kind: Kind;
  onKind: (k: Kind) => void;
  tools: Tool[];
  holdings: Holding[];
  pieces: Piece[];
  employees: DepotEmployee[];
  canManage: boolean;
}) {
  const tx = TEXT[kind];
  const [query, setQuery] = useState(urlQuery);
  const [openId, setOpenId] = useState<number | null>(null);
  const [view, setView] = useState<"list" | "people">("list");
  const [openEmp, setOpenEmp] = useState<number | null>(null);

  const toolInfo = useMemo(() => new Map(allTools.map((t) => [t.id, t])), [allTools]);
  // Yalnız seçilmiş növ
  const tools = useMemo(() => allTools.filter((t) => t.kind === kind), [allTools, kind]);
  const holdings = useMemo(() => allHoldings.filter((h) => toolInfo.get(h.tool_id)?.kind === kind), [allHoldings, toolInfo, kind]);

  const byTool = useMemo(() => {
    const m: Record<number, Holding[]> = {};
    for (const h of holdings) (m[h.tool_id] ??= []).push(h);
    return m;
  }, [holdings]);
  const byEmployee = useMemo(() => {
    const m: Record<number, Holding[]> = {};
    for (const h of holdings) (m[h.employee_id] ??= []).push(h);
    return m;
  }, [holdings]);

  const filtered = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    return tools.filter((t) => {
      const holders = (byTool[t.id] ?? []).map((h) => h.employees?.full_name).join(" ");
      const haystack = norm(`${t.name} ${t.inventory_code} ${holders}`);
      return words.every((w) => haystack.includes(w));
    });
  }, [tools, query, byTool]);

  // Ustalar (rəhbərlik yox): ad və ya üzərindəki alətin/materialın adı ilə axtarış
  const masters = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    return employees.filter((e) => !e.is_management).filter((e) => {
      const names = (byEmployee[e.id] ?? []).map((h) => toolInfo.get(h.tool_id)?.name ?? "").join(" ");
      const haystack = norm(`${e.full_name} ${names}`);
      return words.every((w) => haystack.includes(w));
    });
  }, [employees, query, byEmployee, toolInfo]);

  const open = allTools.find((t) => t.id === openId) ?? null;
  const [history, setHistory] = useState(false);
  const openPerson = employees.find((e) => e.id === openEmp) ?? null;
  const [quickId, setQuickId] = useState<number | null>(null); // sətirdən "Ver"
  const quick = allTools.find((t) => t.id === quickId) ?? null;

  return (
    <div className="flex h-full flex-col gap-4">
      {quick && quick.available > 0 && <QuickGiveModal tool={quick} employees={employees} onClose={() => setQuickId(null)} />}
      {open && (
        <ToolModal tool={open} holders={allHoldings.filter((h) => h.tool_id === open.id)} pieces={pieces.filter((p) => p.tool_id === open.id)}
          employees={employees} canManage={canManage} onClose={() => setOpenId(null)} />
      )}
      {history && <HistoryModal kind={kind} onClose={() => setHistory(false)} />}
      {openPerson && (
        <PersonModal emp={openPerson} kind={kind} holds={byEmployee[openPerson.id] ?? []} toolInfo={toolInfo} tools={tools} canManage={canManage} onClose={() => setOpenEmp(null)} />
      )}

      {/* Axtarış və tablar yerində qalır; yalnız aşağıdakı siyahı bloku öz içində sürüşür (scrollbar gizli) */}
      <div className="search shrink-0">
        <Search size={20} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tx.search} aria-label="Axtarış" />
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <KindTabs kind={kind} onKind={(k) => { onKind(k); setQuery(""); }} />
        <div className="flex items-center gap-2">
        <button type="button" onClick={() => setHistory(true)} className="btn btn-soft btn-sm !h-10"><History size={15} /> Tarixçə</button>
        <div className="inline-flex gap-1 rounded-xl bg-line/60 p-1" role="tablist" aria-label="Görünüş">
          {([["list", "Siyahı"], ["people", "Ustalar üzrə"]] as const).map(([v, label]) => (
            <button key={v} type="button" role="tab" aria-selected={view === v} onClick={() => setView(v)}
              className={`rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors ${view === v ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
              {label}
            </button>
          ))}
        </div>
        </div>
      </div>

      {tools.length === 0 ? (
        <div className="card py-12 text-center">
          <span className="icon-tile mx-auto"><Warehouse size={20} /></span>
          <p className="mt-3 font-semibold">{tx.empty}</p>
          <p className="muted text-sm">{canManage ? "Sağdakı formdan əlavə et." : "Depo məsulu əlavə edir."}</p>
        </div>
      ) : view === "people" ? (
        <div className="card min-h-0 flex-1 overflow-y-auto !p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-[1] bg-[#f8f9fc] text-left text-xs font-semibold text-muted">
              <tr>
                <th className="px-4 py-3">Usta</th>
                <th className="px-4 py-3">{tx.hint}</th>
                <th className="w-24 px-4 py-3 text-center">{tx.peopleCol}</th>
                <th className="w-20 px-4 py-3"><span className="sr-only">Bax</span></th>
              </tr>
            </thead>
            <tbody>
              {masters.map((e) => {
                const holds = byEmployee[e.id] ?? [];
                // Alətdə ədədlərin cəmi, materialda növ sayı (vahidlər fərqli ola bilər: metr + ədəd)
                const total = kind === "tool" ? holds.reduce((n, h) => n + h.quantity, 0) : holds.length;
                // Adlar sətrə sığmır (10 alət ola bilər): yalnız say, siyahı "Bax" ilə pəncərədə açılır
                const oldest = holds.reduce<Holding | null>((o, h) => (!o || h.taken_at < o.taken_at ? h : o), null);
                return (
                  <tr key={e.id} onClick={() => setOpenEmp(e.id)} tabIndex={0}
                    onKeyDown={(ev) => ev.target === ev.currentTarget && (ev.key === "Enter" || ev.key === " ") && setOpenEmp(e.id)}
                    className="cursor-pointer border-t border-line transition-colors hover:bg-primary-soft/40">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2.5">
                        <Avatar employee={e} className="!h-8 !w-8 !text-[11px]" />
                        <span className="font-semibold">{e.full_name}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px]">
                      {holds.length === 0 ? <span className="muted">Yoxdur</span> : (
                        <span className="flex items-center gap-2">
                          {holds.length} növ {kind === "tool" ? "alət" : "material"}
                          {oldest && <HeldBadge takenAt={oldest.taken_at} />}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums">
                      {total ? <span className="inline-block min-w-8 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">{total}</span> : <span className="muted">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={(ev) => { ev.stopPropagation(); setOpenEmp(e.id); }} className="btn btn-secondary btn-sm !h-8">Bax</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {masters.length === 0 && <p className="muted border-t border-line py-8 text-center text-sm">Heç nə tapılmadı.</p>}
        </div>
      ) : (
        <div className="card min-h-0 flex-1 overflow-y-auto !p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-[1] bg-[#f8f9fc] text-left text-xs font-semibold text-muted">
              <tr>
                <th className="px-4 py-3">{tx.col}</th>
                <th className="w-[30%] px-4 py-3">Kimdədir</th>
                <th className="w-28 px-4 py-3 text-center">Cəmi</th>
                <th className="w-28 px-4 py-3 text-center">Ustalarda</th>
                <th className="w-28 px-4 py-3 text-center">{kind === "material" ? "Tam (depoda)" : "Depoda"}</th>
                {kind === "material" && <th className="w-40 px-4 py-3 text-center">Parçalar</th>}
                {canManage && <th className="w-20 px-4 py-3"><span className="sr-only">Ver</span></th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const hs = byTool[t.id] ?? [];
                return (
                <tr key={t.id} onClick={() => setOpenId(t.id)} tabIndex={0}
                  onKeyDown={(e) => e.target === e.currentTarget && (e.key === "Enter" || e.key === " ") && setOpenId(t.id)}
                  className="h-[49px] cursor-pointer border-t border-line transition-colors hover:bg-primary-soft/40">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2.5">
                      <Wrench size={15} className="shrink-0 text-primary" />
                      <span className="font-semibold">{t.name}</span>
                    </span>
                  </td>
                  <td className="max-w-0 px-4 py-3">
                    {hs.length === 0 ? <span className="muted text-[13px]">Depoda</span> : <HoldersCell holders={hs} tool={t} />}
                  </td>
                  {/* Cəmi = tam hissə + parçalar (ümumilikdə nə qədər var) */}
                  <td className="px-4 py-3 text-center font-semibold tabular-nums">{withUnit(t.quantity + t.pieces_total, t)}</td>
                  <td className="px-4 py-3 text-center tabular-nums">{t.given_out ? withUnit(t.given_out, t) : <span className="muted">—</span>}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block min-w-8 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
                      t.available ? "bg-ok-soft text-ok" : "bg-danger-soft text-danger"}`}>
                      {withUnit(t.available, t)}
                    </span>
                    {isLowStock(t) && <span className="ml-1.5 rounded-full bg-[#fff4e0] px-2 py-0.5 text-[11px] font-bold text-[#b45309]" title={`Minimum qalıq: ${t.min_stock}`}>azdır</span>}
                  </td>
                  {kind === "material" && (
                    <td className="px-4 py-3 text-center text-[13px] tabular-nums">
                      {t.pieces_count ? `${t.pieces_count} ədəd · ${t.pieces_total} ${t.unit}` : <span className="muted">—</span>}
                    </td>
                  )}
                  {canManage && (
                    <td className="px-4 py-3 text-right">
                      {t.available > 0 && (
                        <button type="button" onClick={(e) => { e.stopPropagation(); setQuickId(t.id); }} className="btn btn-secondary btn-sm !h-8">Ver</button>
                      )}
                    </td>
                  )}
                </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="muted border-t border-line py-8 text-center text-sm">Heç nə tapılmadı.</p>}
        </div>
      )}
    </div>
  );
}

// toolName verilirsə: usta pəncərəsində (sətirdə usta yox, alətin adı göstərilir). unit: ölçü vahidi (ədəd, metr, kq...)
// pack: qablı materialda (balon) tam qabların sayı mötərizədə göstərilir: "11 kq (1 balon)"
// Alət: "Geri al" (ustada 1 ədəddirsə dərhal, çoxdursa neçə ədəd olduğu soruşulur).
// Material: "Təhvil ver": usta neçə işlədib (və ya neçə qaytarır) deyilir; işlənən sərf olunur, qalan hissə depoya ayrı parça kimi yazılır.
function HolderRow({ holding, canManage, toolName, unit = "ədəd", material = false, pack = null }: {
  holding: Holding; canManage: boolean; toolName?: string; unit?: string; material?: boolean; pack?: PackInfo | null;
}) {
  const [asking, setAsking] = useState(false);
  // Material təhvili: usta neçə işlədib və neçə qaytarır; qalan hissə ustada qalır.
  // İkisi də 0 ola bilər (biri kifayətdir); cəmi ustada olandan çox olmaz; cəmi hamıya bərabərdirsə, təhvil bağlanır.
  const [usedVal, setUsedVal] = useState(0);
  const [retVal, setRetVal] = useState(0);
  // Qablı materialda (balon...) təhvil də balonla və ya ölçü vahidi ilə (kq) yazıla bilər (verəndə olduğu kimi)
  const [byPack, setByPack] = useState(false);
  const packed = !!pack?.pack_size && !!pack?.pack_name;
  const factor = packed && byPack ? pack!.pack_size! : 1;
  const unitLabel = packed && byPack ? pack!.pack_name! : unit;
  const usedBase = usedVal * factor; // ölçü vahidi ilə
  const retBase = retVal * factor;
  const invalid = usedBase + retBase > holding.quantity;
  const limit = Math.floor(holding.quantity / factor);
  const [state, action, pending] = useActionState(
    async (_prev: Awaited<ReturnType<typeof returnTool>>, fd: FormData) => {
      if (material) return settleMaterial(holding.id, usedBase, retBase);
      const qty = Number(fd.get("quantity") ?? holding.quantity);
      if (qty > holding.quantity) return { error: `Ustada cəmi ${holding.quantity} ${unit} var.` };
      return returnTool(holding.id, qty);
    },
    null,
  );
  const resetForm = () => { setAsking(false); setUsedVal(0); setRetVal(0); setByPack(false); };
  useOnSuccess(state, resetForm, material ? "Təhvil yazıldı" : "Geri alındı");

  const rest = holding.quantity - usedBase - retBase;
  const parts = [
    usedBase > 0 && `${showQty(usedBase, unit, pack)} sərf olunur`,
    retBase > 0 && `${showQty(retBase, unit, pack)} depoya qayıdır${unit.trim().toLowerCase() === "metr" ? (retBase <= PIECE_MAX ? " (parça)" : " (tam boru)") : ""}`,
    rest > 0 ? `${showQty(rest, unit, pack)} ustada qalır` : "ustada heç nə qalmır",
  ].filter(Boolean);
  const hint = invalid ? "İşlədilən və qaytarılanın cəmi ustada olandan çox ola bilməz."
    : usedBase + retBase === 0 ? "Neçə işlədiyini və/və ya neçə qaytardığını yaz, qalanı ustada qalır."
    : parts.join(" · ");

  return (
    <li className="py-2">
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
        <HeldBadge takenAt={holding.taken_at} always />
        <span className="text-sm font-bold tabular-nums text-primary">{showQty(holding.quantity, unit, pack)}</span>
        {canManage && material && !asking && (
          <button type="button" onClick={() => setAsking(true)} className="btn btn-secondary btn-sm !h-8">Təhvil ver</button>
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
      </div>
      {canManage && material && asking && (
        <ActionForm action={action} className="mt-2 rounded-xl bg-bg p-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <label className="flex items-center gap-2">
              <span className="text-sm font-semibold">İşlədilib</span>
              <QuantityInput key={`u-${byPack}`} min={0} defaultValue={0} limit={limit} className="!h-8 !w-20" onValue={setUsedVal}
                limitText={(l) => `Ustada cəmi ${l} ${unitLabel} var.`} />
            </label>
            <label className="flex items-center gap-2">
              <span className="text-sm font-semibold">Qaytarılır</span>
              <QuantityInput key={`r-${byPack}`} min={0} defaultValue={0} limit={limit} className="!h-8 !w-20" onValue={setRetVal}
                limitText={(l) => `Ustada cəmi ${l} ${unitLabel} var.`} />
            </label>
            {packed ? (
              <span className="inline-flex shrink-0 gap-0.5 rounded-lg bg-line/60 p-0.5" role="tablist" aria-label="Vahid">
                {([[false, unit], [true, pack!.pack_name!]] as const).map(([v, label]) => (
                  <button key={String(v)} type="button" role="tab" aria-selected={byPack === v} onClick={() => { setByPack(v); setUsedVal(0); setRetVal(0); }}
                    className={`h-7 rounded-md px-2 text-xs font-semibold transition-colors ${byPack === v ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
                    {label}
                  </button>
                ))}
              </span>
            ) : (
              <span className="muted text-sm">{unit}</span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <p className={`min-w-0 flex-1 text-xs ${invalid ? "font-semibold text-danger" : "muted"}`}>{hint}</p>
            <button type="submit" disabled={pending || invalid || usedBase + retBase === 0} className="btn btn-primary btn-sm !h-8">{pending ? "..." : "Təhvil al"}</button>
            <button type="button" onClick={resetForm} className="btn btn-cancel btn-sm !h-8">Ləğv</button>
          </div>
        </ActionForm>
      )}
    </li>
  );
}

// Siyahıdakı sətirdən sürətli "Ver": alətin pəncərəsini açmadan usta seç, say yaz, ver
function QuickGiveModal({ tool, employees, onClose }: { tool: Tool; employees: DepotEmployee[]; onClose: () => void }) {
  return (
    <Modal onClose={onClose} labelledBy="quick-give-title" className="!max-w-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="quick-give-title" className="truncate text-lg font-bold">{tool.name}: kimə verilir?</h2>
          <p className="muted text-sm">Depoda <b className="text-ok">{withUnit(tool.available, tool)}</b></p>
        </div>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>
      <GiveForm tool={tool} employees={employees} onDone={onClose} />
    </Modal>
  );
}

// Bir ustaya bir neçə alət/material birdən: siyahıdan seç, hər birinin sayını yaz, bir düymə ilə ver
function BulkGiveModal({ emp, kind, tools, onClose }: { emp: DepotEmployee; kind: Kind; tools: Tool[]; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [qty, setQty] = useState<Record<number, string>>({}); // seçilənlər: id → yazılan say (mətn: sahəni tam silib yenidən yazmaq olsun)
  const num = (id: number) => (qty[id]?.trim() === "" ? NaN : Number(qty[id]));
  const [pending, setPending] = useState(false);
  const available = useMemo(() => tools.filter((t) => t.available > 0), [tools]);
  const shown = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    return available.filter((t) => words.every((w) => norm(`${t.name} ${t.inventory_code}`).includes(w)));
  }, [available, query]);
  const chosen = available.filter((t) => qty[t.id] !== undefined);
  const okQty = (t: Tool) => Number.isInteger(num(t.id)) && num(t.id) >= 1 && num(t.id) <= t.available;
  const valid = chosen.length > 0 && chosen.every(okQty);

  const toggle = (t: Tool) => setQty((q) => {
    const next = { ...q };
    if (next[t.id] === undefined) next[t.id] = "1"; else delete next[t.id];
    return next;
  });

  async function give() {
    if (!valid) return;
    setPending(true);
    const r = await giveTools(emp.id, chosen.map((t) => ({ toolId: t.id, name: t.name, quantity: num(t.id) })));
    setPending(false);
    if (r?.error) return toast.error(r.error);
    toast.success(`${chosen.length} ${kind === "tool" ? "alət" : "material"} verildi`);
    onClose();
  }

  return (
    <Modal onClose={onClose} labelledBy="bulk-give-title" className="!max-w-lg">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="bulk-give-title" className="truncate text-lg font-bold">{emp.full_name}: {kind === "tool" ? "alət ver" : "material ver"}</h2>
          <p className="muted text-sm">Lazım olanları işarələ, sayını yaz, bir dəfəyə ver.</p>
        </div>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>

      <div className="search">
        <Search size={16} className="!left-4" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={TEXT[kind].search.split(" və ")[0] + " axtar..."} aria-label="Axtarış" autoFocus
          className="!h-10 !pl-10 !text-sm" />
      </div>

      {available.length === 0 ? (
        <p className="muted py-6 text-center text-sm">Depoda verilə bilən boş {kind === "tool" ? "alət" : "material"} yoxdur.</p>
      ) : (
        <ul className="nice-scroll mt-3 max-h-[min(360px,calc(100vh-340px))] divide-y divide-line overflow-y-auto">
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
                    <input type="number" min={1} max={t.available} step={1} value={qty[t.id]} aria-label={`${t.name} sayı`}
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
          {pending ? "Gözləyin..." : chosen.length ? `Seçilənləri ver (${chosen.length})` : `Yuxarıdan ${kind === "tool" ? "alət" : "material"} seç`}
        </button>
        <button type="button" onClick={onClose} className="btn btn-cancel">Ləğv et</button>
      </div>
    </Modal>
  );
}

function GiveForm({ tool, employees, onDone }: { tool: Tool; employees: DepotEmployee[]; onDone?: () => void }) {
  const [state, action, pending] = useActionState(giveTool, null);
  const [picked, setPicked] = useState<number | null>(null);
  const [formKey, setFormKey] = useState(0);
  // Qablı materialda (balon...) say qabla ("1 balon") və ya ölçü vahidi ilə ("11 kq") yazıla bilər
  const [byPack, setByPack] = useState(false);
  useOnSuccess(state, () => { setPicked(null); setFormKey((k) => k + 1); onDone?.(); }, "Verildi");
  // Alət/material yalnız ustaya verilir (rəhbərlik siyahıda yoxdur; bazada da trigger yoxlayır)
  const items = employees.filter((e) => !e.is_management).map((e) => ({ id: e.id, name: e.full_name }));
  const packed = !!tool.pack_size && !!tool.pack_name;
  const factor = packed && byPack ? tool.pack_size! : 1;
  const unitLabel = packed && byPack ? tool.pack_name! : tool.unit;
  const limit = Math.floor(tool.available / factor);

  // Göndərməzdən əvvəl də yoxla: say depodakından çoxdursa, sorğu getmir, tost çıxır. Baza həmişə ölçü vahidi ilə işləyir.
  function submit(fd: FormData) {
    const wanted = Number(fd.get("quantity"));
    const amount = wanted * factor;
    if (amount > tool.available) {
      toast.error(giveLimitText(limit, wanted, unitLabel));
      return;
    }
    fd.set("quantity", String(amount));
    action(fd);
  }

  if (tool.available === 0) {
    return <p className="muted text-center text-sm">Depoda boş qalmayıb. Vermək üçün əvvəl geri alın və ya miqdarı artırın.</p>;
  }
  return (
    <ActionForm key={formKey} action={submit} className="flex gap-2 pb-4">
      <input type="hidden" name="tool_id" value={tool.id} />
      <ToolPicker items={items} value={picked} onChange={setPicked} name="employee_id" icon={Users}
        placeholder="Kimə verilir?" emptyLabel="Aktiv əməkdaş yoxdur" searchLabel="Usta axtar..." />
      {packed && (
        <span className="inline-flex shrink-0 gap-0.5 self-start rounded-lg bg-line/60 p-0.5" role="tablist" aria-label="Vahid">
          {([[false, tool.unit], [true, tool.pack_name!]] as const).map(([v, label]) => (
            <button key={String(v)} type="button" role="tab" aria-selected={byPack === v} onClick={() => setByPack(v)}
              className={`h-8 rounded-md px-2.5 text-xs font-semibold transition-colors ${byPack === v ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
              {label}
            </button>
          ))}
        </span>
      )}
      <QuantityInput key={String(byPack)} limit={limit} limitText={(l, w) => giveLimitText(l, w, unitLabel)} />
      <button type="submit" disabled={pending || !picked} className="btn btn-primary btn-sm !h-9">{pending ? "..." : "Ver"}</button>
    </ActionForm>
  );
}

function EditToolModal({ tool, onClose }: { tool: Tool; onClose: () => void }) {
  const [state, action, pending] = useActionState(updateTool.bind(null, tool.id), null);
  useOnSuccess(state, onClose);
  const kind = tool.kind as Kind;

  // Say ustalardakından az ola bilməz: dərhal bildir
  function submit(fd: FormData) {
    const qty = Number(fd.get("quantity"));
    if (qty < tool.given_out) {
      toast.error(`Ustalarda ${tool.given_out} ${tool.unit} var — miqdar ən azı ${tool.given_out} olmalıdır.`);
      return;
    }
    action(fd);
  }

  return (
    <Modal onClose={onClose} labelledBy="edit-tool-title" className="!max-w-md">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 id="edit-tool-title" className="text-lg font-bold">{TEXT[kind].editTitle}</h2>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>
      <SaveConfirmForm action={submit} className="space-y-4">
        <ToolFields t={tool} kind={kind} />
        <Buttons pending={pending} label="Yadda saxla" onCancel={onClose} />
      </SaveConfirmForm>
    </Modal>
  );
}

// Parçanı kimə və nə qədər verəsən: hamısı və ya bir hissəsi (qalan hissə depoda parça kimi qalır)
function PieceGiveModal({ piece, unit, employees, onClose }: { piece: Piece; unit: string; employees: DepotEmployee[]; onClose: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [amount, setAmount] = useState(piece.length);
  const [pending, setPending] = useState(false);
  const items = employees.filter((e) => !e.is_management).map((e) => ({ id: e.id, name: e.full_name }));
  const valid = !!picked && Number.isInteger(amount) && amount >= 1 && amount <= piece.length;
  const rest = piece.length - amount;

  async function give() {
    if (!valid || !picked) return;
    setPending(true);
    const r = await givePiece(piece.id, picked, amount);
    setPending(false);
    if (r?.error) return toast.error(r.error);
    toast.success("Verildi");
    onClose();
  }

  return (
    <Modal onClose={onClose} labelledBy="piece-give-title" className="!max-w-md">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="piece-give-title" className="text-lg font-bold">{piece.length} {unit} parça: kimə verilir?</h2>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">Nə qədər:</span>
        <QuantityInput limit={piece.length} defaultValue={piece.length} className="!w-20" onValue={setAmount}
          limitText={(limit) => `Parçada cəmi ${limit} ${unit} var.`} />
        <span className="muted text-sm">{unit} (parçada {piece.length})</span>
      </div>
      <p className="muted mt-3 min-h-4 text-xs">
        {valid ? (rest > 0 ? `${rest} ${unit} parça kimi depoda qalır.` : "Parçanın hamısı verilir.") : ""}
      </p>
      <div className="mt-2 flex gap-2 pb-2">
        <ToolPicker items={items} value={picked} onChange={setPicked} name="employee_id" icon={Users}
          placeholder="Usta seç..." emptyLabel="Aktiv əməkdaş yoxdur" searchLabel="Usta axtar..." />
        <button type="button" disabled={pending || !valid} onClick={give} className="btn btn-primary btn-sm !h-9">{pending ? "..." : "Ver"}</button>
      </div>
    </Modal>
  );
}

// Depodakı bir parça: neçə metr, kimdən qalıb, nə vaxt; ustaya vermək və ya silmək (sərf olunub)
function PieceRow({ piece, unit, employees, canManage }: { piece: Piece; unit: string; employees: DepotEmployee[]; canManage: boolean }) {
  const [giving, setGiving] = useState(false);
  const date = piece.created_at.slice(0, 10).split("-").reverse().join(".");
  const original = piece.original_length ?? piece.length;
  // Qaytaran ustanın ilkin qaytardığı miqdar: "Kərimov Orxan 2 metr qaytarıb"
  const who = piece.employees ? `${piece.employees.full_name} ${original} ${unit} qaytarıb` : "Depoda qalan hissə";
  return (
    <li className="flex items-center gap-3 py-2">
      {giving && <PieceGiveModal piece={piece} unit={unit} employees={employees} onClose={() => setGiving(false)} />}
      {/* Qalan uzunluq; hissə verilibsə ilkin miqdar da yazılır ki, "Orxan 1 metr qaytarıb" kimi yanlış təsəvvür yaranmasın */}
      <span className="w-28 shrink-0">
        <span className="block text-sm font-bold tabular-nums">{piece.length} {unit}</span>
        {original > piece.length && <span className="muted block text-[11px]">qalıb · ilkin {original} {unit}</span>}
      </span>
      <span className="muted min-w-0 flex-1 truncate text-[13px]" title={who}>{who} · {date}</span>
      {canManage && (
        <>
          <button type="button" onClick={() => setGiving(true)} className="btn btn-secondary btn-sm !h-8">Ver</button>
          <ConfirmButton onConfirm={async () => { await discardPiece(piece.id); }} success={false} className="icon-btn icon-btn-danger" title="Parçanı sil"
            question={`${piece.length} ${unit} parça siyahıdan silinəcək (sərf olunub).`}>
            <Trash2 size={15} />
          </ConfirmButton>
        </>
      )}
    </li>
  );
}

function ToolModal({ tool, holders, pieces, employees, canManage, onClose }: {
  tool: Tool;
  holders: Holding[];
  pieces: Piece[];
  employees: DepotEmployee[];
  canManage: boolean;
  onClose: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const kind = tool.kind as Kind;
  const material = kind === "material";

  return (
    <Modal onClose={onClose} labelledBy={`tool-${tool.id}-title`} className="!max-w-xl">
      {editing && <EditToolModal tool={tool} onClose={() => setEditing(false)} />}
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h2 id={`tool-${tool.id}-title`} className="truncate text-xl font-bold">{tool.name}</h2>
          {material ? (
            <>
              {/* Ümumilikdə nə qədər var = tam hissə + parçalar */}
              <p className="mt-1 text-sm">Ümumi <b>{withUnit(tool.quantity + tool.pieces_total, tool)}</b></p>
              <p className="muted mt-0.5 text-[13px]">
                tam: depoda <b className={tool.available ? "text-ok" : "text-danger"}>{withUnit(tool.available, tool)}</b>, ustalarda{" "}
                <b className="text-primary">{withUnit(tool.given_out, tool)}</b> · parçalar: <b className="text-ink">{tool.pieces_count} ədəd, {withUnit(tool.pieces_total, tool)}</b>
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm">
              Cəmi <b>{withUnit(tool.quantity, tool)}</b> · ustalarda <b className="text-primary">{withUnit(tool.given_out, tool)}</b> · depoda{" "}
              <b className={tool.available ? "text-ok" : "text-danger"}>{withUnit(tool.available, tool)}</b>
            </p>
          )}
        </div>
        {canManage && (
          <>
            <button type="button" onClick={() => setEditing(true)} className="icon-btn" title="Redaktə et" aria-label="Redaktə et"><Pencil size={16} /></button>
            {/* Ustalarda olan alət silinmir: əvvəl geri alınmalıdır */}
            {tool.given_out ? (
              <button type="button" className="icon-btn" title={TEXT[kind].deleteTitle} aria-label={TEXT[kind].deleteTitle}
                onClick={() => toast.error(`Ustalarda ${tool.given_out} ${tool.unit} var — silmək üçün əvvəl geri alın.`)}>
                <Trash2 size={16} />
              </button>
            ) : (
              <ConfirmButton onConfirm={() => deleteTool(tool.id, kind)} success={false} className="icon-btn icon-btn-danger" title={TEXT[kind].deleteTitle}>
                <Trash2 size={16} />
              </ConfirmButton>
            )}
          </>
        )}
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>

      <h3 className="mb-1 mt-5 text-xs font-bold uppercase tracking-wide text-muted">Kimdədir</h3>
      {holders.length === 0 ? (
        <p className="muted py-3 text-sm">Hamısı depodadır.</p>
      ) : (
        <ul className="nice-scroll max-h-60 divide-y divide-line overflow-y-auto">
          {holders.map((h) => <HolderRow key={h.id} holding={h} canManage={canManage} unit={tool.unit} material={material} pack={tool} />)}
        </ul>
      )}

      {/* Parçalar: hər biri ayrıca (3 usta 2 metr qaytarıbsa, 3 ədəd 2 metrlik parça, 6 metrlik tam boru yox) */}
      {material && (
        <>
          <h3 className="mb-1 mt-5 text-xs font-bold uppercase tracking-wide text-muted">Depodakı parçalar ({pieces.length})</h3>
          {pieces.length === 0 ? (
            <p className="muted py-3 text-sm">Parça yoxdur. Usta işlədib qalanını təhvil verəndə burada görünəcək.</p>
          ) : (
            // 4 sətir görünür (hər sətir 48px + 3 xətt = 195px), qalanı gizli zolaqla sürüşür; 4-dən çoxdursa aşağıda solğunlaşma
            <ul className={`max-h-[195px] divide-y divide-line overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
              pieces.length > 4 ? "[mask-image:linear-gradient(to_bottom,black_calc(100%-24px),transparent)]" : ""}`}>
              {pieces.map((p) => <PieceRow key={p.id} piece={p} unit={tool.unit} employees={employees} canManage={canManage} />)}
            </ul>
          )}
        </>
      )}

      {canManage && (
        <div className="mt-4 border-t border-line pt-4">
          <GiveForm tool={tool} employees={employees} />
        </div>
      )}
    </Modal>
  );
}

// Ustanın pəncərəsi: üzərində hansı alət/material nə qədər var (geri almaq da olur)
function PersonModal({ emp, kind, holds, toolInfo, tools, canManage, onClose }: {
  emp: DepotEmployee;
  kind: Kind;
  holds: Holding[];
  toolInfo: Map<number, Tool>;
  tools: Tool[];
  canManage: boolean;
  onClose: () => void;
}) {
  const [giving, setGiving] = useState(false);
  const total = kind === "tool" ? holds.reduce((n, h) => n + h.quantity, 0) : holds.length;
  const summary = !total ? (kind === "tool" ? "Üzərində alət yoxdur" : "Üzərində material yoxdur")
    : kind === "tool" ? `Üzərində ${total} ədəd alət var` : `Üzərində ${total} növ material var`;
  return (
    <Modal onClose={onClose} labelledBy={`emp-${emp.id}-title`} className="!max-w-xl">
      <div className="flex items-center gap-3">
        <Avatar employee={emp} className="!h-11 !w-11 !text-sm" />
        <div className="min-w-0 flex-1">
          <h2 id={`emp-${emp.id}-title`} className="truncate text-xl font-bold">{emp.full_name}</h2>
          <p className="muted text-sm">{summary}</p>
        </div>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>
      {giving && <BulkGiveModal emp={emp} kind={kind} tools={tools} onClose={() => setGiving(false)} />}
      {canManage && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => setGiving(true)} className="btn btn-primary btn-sm !h-9">
            <Plus size={14} /> {kind === "tool" ? "Alət ver" : "Material ver"}
          </button>
          {/* Yalnız alətdə: materialda "nə qədər işlədi" deyilməlidir, ona görə tək-tək təhvil alınır */}
          {kind === "tool" && holds.length > 1 && (
            <ConfirmButton className="btn btn-secondary btn-sm !h-9" title="Hamısını geri al" confirmLabel="Bəli, geri al" success={false}
              question={`${emp.full_name} üzərindəki ${total} ədəd alət depoya qaytarılacaq.`}
              onConfirm={async () => {
                const r = await returnAllTools(holds.map((h) => ({ id: h.id, quantity: h.quantity })));
                if (r?.error) toast.error(r.error); else toast.success("Hamısı geri alındı");
              }}>
              <Undo2 size={14} /> Hamısını geri al
            </ConfirmButton>
          )}
        </div>
      )}
      {holds.length > 0 && (
        <ul className="nice-scroll mt-4 max-h-[min(433px,calc(100vh-260px))] divide-y divide-line overflow-y-auto">
          {holds.map((h) => (
            <HolderRow key={h.id} holding={h} canManage={canManage} toolName={toolInfo.get(h.tool_id)?.name ?? "—"} unit={toolInfo.get(h.tool_id)?.unit} material={kind === "material"} pack={toolInfo.get(h.tool_id)} />
          ))}
        </ul>
      )}
    </Modal>
  );
}
