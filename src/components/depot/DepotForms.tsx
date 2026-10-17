
import { useActionState, useMemo, useRef, useState } from "react";
import { KeyRound, Pencil, Plus, Search, ShieldCheck, Trash2, UserPlus, Users, Warehouse, Wrench, X } from "lucide-react";
import { addStorekeeper, addTool, deleteTool, discardPiece, finishMaterial, givePiece, giveTool, returnTool, setStorekeeper, updateTool } from "@/actions/tools";
import { ConfirmButton } from "@/components/ConfirmButton";
import { AccountSection, Avatar, type Accounts } from "@/components/employees/EmployeeForms";
import { ActionForm, Buttons, Field, SaveConfirmForm, useOnSuccess } from "@/components/forms";
import { Modal } from "@/components/Modal";
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
const showQty = (n: number, unit: string, p?: PackInfo | null) => `${n} ${unit}${p ? packSuffix(n, p) : ""}`;

// Axtarış üçün sadələşdirmə: "Əlizadə" və "elizade" eyni tapılsın.
function norm(s: string | null | undefined) {
  return (s ?? "")
    .toLowerCase()
    .replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g");
}

// Alət / material əlavə et və redaktə et sahələri. Vahid (ədəd, kq, metr, litr...) açılan siyahıdan seçilir (alət və material üçün).
// Ad: mövcud adlar təklif olunur (eyni material ikinci dəfə yazılmasın; təkrar ad əlavə edəndə də bloklanır).
// Qablaşdırılmış material (qaz balonu...) üçün qab (balon) və hər qabdakı miqdar (11 kq) yazılır: say qabla daxil edilir,
// daxildə ölçü vahidi ilə saxlanır (4 balon × 11 kq = 44 kq). Beləcə usta 1 balon götürüb 5 kq qaytara bilir.
function ToolFields({ t, kind, names = [] }: { t?: Tool; kind: Kind; names?: string[] }) {
  const tx = TEXT[kind];
  const editing = !!t;
  const [count, setCount] = useState(t?.quantity ?? 1);
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
          <input name="quantity" type="number" min={0} step={1} value={count} onChange={(e) => setCount(Number(e.target.value))} required className="field" />
        </Field>
        <Field label="Vahid">
          <UnitSelect value={unit} onChange={setUnit} options={unitOptions} />
        </Field>
      </div>
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
  const [query, setQuery] = useState("");
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
  const openPerson = employees.find((e) => e.id === openEmp) ?? null;

  return (
    <div className="space-y-4">
      {open && (
        <ToolModal tool={open} holders={allHoldings.filter((h) => h.tool_id === open.id)} pieces={pieces.filter((p) => p.tool_id === open.id)}
          employees={employees} canManage={canManage} onClose={() => setOpenId(null)} />
      )}
      {openPerson && (
        <PersonModal emp={openPerson} kind={kind} holds={byEmployee[openPerson.id] ?? []} toolInfo={toolInfo} canManage={canManage} onClose={() => setOpenEmp(null)} />
      )}

      {/* Axtarış öz yerində qalır; üstündəki boşluq (before) və altındakı zolaq bərk fonludur: sürüşən məzmun orada görünmür */}
      <div className="sticky top-0 z-10 rounded-[14px] shadow-[0_16px_0_0_#f8f9fc] before:absolute before:inset-x-0 before:bottom-full before:h-8 before:bg-[#f8f9fc]">
        <div className="search">
        <Search size={20} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tx.search} aria-label="Axtarış" />
      </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <KindTabs kind={kind} onKind={(k) => { onKind(k); setQuery(""); }} />
        <div className="inline-flex gap-1 rounded-xl bg-line/60 p-1" role="tablist" aria-label="Görünüş">
          {([["list", "Siyahı"], ["people", "Ustalar üzrə"]] as const).map(([v, label]) => (
            <button key={v} type="button" role="tab" aria-selected={view === v} onClick={() => setView(v)}
              className={`rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors ${view === v ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {tools.length === 0 ? (
        <div className="card py-12 text-center">
          <span className="icon-tile mx-auto"><Warehouse size={20} /></span>
          <p className="mt-3 font-semibold">{tx.empty}</p>
          <p className="muted text-sm">{canManage ? "Sağdakı formdan əlavə et." : "Depo məsulu əlavə edir."}</p>
        </div>
      ) : view === "people" ? (
        <div className="card overflow-hidden !p-0">
          <table className="w-full text-sm">
            <thead className="bg-[#f8f9fc] text-left text-xs font-semibold text-muted">
              <tr>
                <th className="px-4 py-3">Usta</th>
                <th className="px-4 py-3">{tx.hint}</th>
                <th className="w-24 px-4 py-3 text-center">{tx.peopleCol}</th>
              </tr>
            </thead>
            <tbody>
              {masters.map((e) => {
                const holds = byEmployee[e.id] ?? [];
                // Alətdə ədədlərin cəmi, materialda növ sayı (vahidlər fərqli ola bilər: metr + ədəd)
                const total = kind === "tool" ? holds.reduce((n, h) => n + h.quantity, 0) : holds.length;
                const label = (h: Holding) => {
                  const t = toolInfo.get(h.tool_id);
                  if (!t) return "—";
                  return kind === "material" ? `${t.name} ${h.quantity} ${t.unit}${packSuffix(h.quantity, t)}` : `${t.name}${h.quantity > 1 ? ` ×${h.quantity}` : ""}`;
                };
                return (
                  <tr key={e.id} onClick={() => setOpenEmp(e.id)} tabIndex={0}
                    onKeyDown={(ev) => (ev.key === "Enter" || ev.key === " ") && setOpenEmp(e.id)}
                    className="cursor-pointer border-t border-line transition-colors hover:bg-primary-soft/40">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2.5">
                        <Avatar employee={e} className="!h-8 !w-8 !text-[11px]" />
                        <span className="font-semibold">{e.full_name}</span>
                      </span>
                    </td>
                    <td className="max-w-0 px-4 py-3">
                      <span className="block truncate text-[13px]" title={holds.map(label).join(", ")}>
                        {holds.length === 0 ? <span className="muted">Yoxdur</span> : holds.map(label).join(", ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums">
                      {total ? <span className="inline-block min-w-8 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">{total}</span> : <span className="muted">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {masters.length === 0 && <p className="muted border-t border-line py-8 text-center text-sm">Heç nə tapılmadı.</p>}
        </div>
      ) : (
        <div className="card overflow-hidden !p-0">
          <table className="w-full text-sm">
            <thead className="bg-[#f8f9fc] text-left text-xs font-semibold text-muted">
              <tr>
                <th className="px-4 py-3">{tx.col}</th>
                <th className="w-28 px-4 py-3 text-center">Cəmi</th>
                <th className="w-28 px-4 py-3 text-center">Ustalarda</th>
                <th className="w-28 px-4 py-3 text-center">{kind === "material" ? "Tam (depoda)" : "Depoda"}</th>
                {kind === "material" && <th className="w-40 px-4 py-3 text-center">Parçalar</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} onClick={() => setOpenId(t.id)} tabIndex={0}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpenId(t.id)}
                  className="cursor-pointer border-t border-line transition-colors hover:bg-primary-soft/40">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2.5">
                      <Wrench size={15} className="shrink-0 text-primary" />
                      <span className="font-semibold">{t.name}</span>
                      {t.inventory_code && <span className="muted text-xs">{t.inventory_code}</span>}
                    </span>
                  </td>
                  {/* Cəmi = tam hissə + parçalar (ümumilikdə nə qədər var) */}
                  <td className="px-4 py-3 text-center font-semibold tabular-nums">{withUnit(t.quantity + t.pieces_total, t)}</td>
                  <td className="px-4 py-3 text-center tabular-nums">{t.given_out ? withUnit(t.given_out, t) : <span className="muted">—</span>}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block min-w-8 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
                      t.available ? "bg-ok-soft text-ok" : "bg-danger-soft text-danger"}`}>
                      {withUnit(t.available, t)}
                    </span>
                  </td>
                  {kind === "material" && (
                    <td className="px-4 py-3 text-center text-[13px] tabular-nums">
                      {t.pieces_count ? `${t.pieces_count} ədəd · ${t.pieces_total} ${t.unit}` : <span className="muted">—</span>}
                    </td>
                  )}
                </tr>
              ))}
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
  // Material: "İşlədilib" və ya "Qaytarılır" (usta qaz balonundan 5 kq qaytarır): eyni nəticə, fərqli yazılış
  const [mode, setMode] = useState<"used" | "left">("used");
  const [val, setVal] = useState(0);
  // Qablı materialda (balon...) təhvil də balonla və ya ölçü vahidi ilə (kq) yazıla bilər (verəndə olduğu kimi)
  const [byPack, setByPack] = useState(false);
  const packed = !!pack?.pack_size && !!pack?.pack_name;
  const factor = packed && byPack ? pack!.pack_size! : 1;
  const unitLabel = packed && byPack ? pack!.pack_name! : unit;
  const valBase = val * factor; // ölçü vahidi ilə
  const used = mode === "used" ? valBase : holding.quantity - valBase;
  const invalid = valBase > holding.quantity;
  const limit = Math.floor(holding.quantity / factor);
  const [state, action, pending] = useActionState(
    async (_prev: Awaited<ReturnType<typeof returnTool>>, fd: FormData) => {
      const raw = Number(fd.get("quantity") ?? holding.quantity);
      const qty = material ? raw * factor : raw; // material: yazılan balon da olsa, baza ölçü vahidi ilə işləyir
      if (qty > holding.quantity) return { error: `Ustada cəmi ${holding.quantity} ${unit} var.` };
      if (material) return finishMaterial(holding.id, mode === "used" ? qty : holding.quantity - qty);
      return returnTool(holding.id, qty);
    },
    null,
  );
  useOnSuccess(state, () => { setAsking(false); setVal(0); setMode("used"); setByPack(false); }, material ? "Təhvil alındı" : "Geri alındı");

  const leftover = holding.quantity - used;
  const hint = used === 0 ? `Heç nə işlənməyib: ${holding.quantity} ${unit} tam depoya qayıdır.`
    : leftover > 0 ? `${showQty(leftover, unit, pack)} qalıb: depoya ayrıca parça kimi yazılır.`
    : "Hamısı işlənib: depoya heç nə qayıtmır.";

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
          <div className="mb-2 inline-flex gap-0.5 rounded-lg bg-line/60 p-0.5" role="tablist" aria-label="Təhvil yazılışı">
            {([["used", "İşlədilib"], ["left", "Qaytarılır"]] as const).map(([m, label]) => (
              <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setVal(0); }}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${mode === m ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{mode === "used" ? "İşlədilib:" : "Qaytarılır:"}</span>
            <QuantityInput key={`${mode}-${byPack}`} min={0} defaultValue={0} limit={limit} className="!h-8 !w-20" onValue={setVal}
              limitText={(l) => `Ustada cəmi ${l} ${unitLabel} var.`} />
            {packed ? (
              <span className="inline-flex shrink-0 gap-0.5 rounded-lg bg-line/60 p-0.5" role="tablist" aria-label="Vahid">
                {([[false, unit], [true, pack!.pack_name!]] as const).map(([v, label]) => (
                  <button key={String(v)} type="button" role="tab" aria-selected={byPack === v} onClick={() => { setByPack(v); setVal(0); }}
                    className={`h-7 rounded-md px-2 text-xs font-semibold transition-colors ${byPack === v ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
                    {label}
                  </button>
                ))}
              </span>
            ) : (
              <span className="muted text-sm">{unit}</span>
            )}
            <button type="submit" disabled={pending || invalid} className="btn btn-primary btn-sm !h-8 ml-auto">{pending ? "..." : "Təhvil al"}</button>
            <button type="button" onClick={() => { setAsking(false); setVal(0); setMode("used"); setByPack(false); }} className="btn btn-cancel btn-sm !h-8">Ləğv</button>
          </div>
          <p className="muted mt-2 text-xs">{invalid ? "Ustada olandan çox ola bilməz." : hint}</p>
        </ActionForm>
      )}
    </li>
  );
}

function GiveForm({ tool, employees }: { tool: Tool; employees: DepotEmployee[] }) {
  const [state, action, pending] = useActionState(giveTool, null);
  const [picked, setPicked] = useState<number | null>(null);
  const [formKey, setFormKey] = useState(0);
  // Qablı materialda (balon...) say qabla ("1 balon") və ya ölçü vahidi ilə ("11 kq") yazıla bilər
  const [byPack, setByPack] = useState(false);
  useOnSuccess(state, () => { setPicked(null); setFormKey((k) => k + 1); }, "Verildi");
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
  const who = piece.employees ? `${piece.employees.full_name} ${original} ${unit} qaytarıb` : "Qaytaran bilinmir";
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
function PersonModal({ emp, kind, holds, toolInfo, canManage, onClose }: {
  emp: DepotEmployee;
  kind: Kind;
  holds: Holding[];
  toolInfo: Map<number, Tool>;
  canManage: boolean;
  onClose: () => void;
}) {
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
