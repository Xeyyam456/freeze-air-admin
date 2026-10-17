
import { useActionState, useMemo, useRef, useState } from "react";
import { Pencil, Plus, Search, ShieldCheck, Trash2, UserPlus, Users, Warehouse, Wrench, X } from "lucide-react";
import { addTool, deleteTool, giveTool, returnTool, setStorekeeper, updateTool } from "@/actions/tools";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Avatar } from "@/components/employees/EmployeeForms";
import { ActionForm, Buttons, Field, SaveConfirmForm, useOnSuccess } from "@/components/forms";
import { Modal } from "@/components/Modal";
import { giveLimitText, QuantityInput } from "@/components/QuantityInput";
import { ToolPicker } from "@/components/ToolPicker";
import type { Tables } from "@/lib/database.types";
import { toast } from "@/lib/toast";

export type Tool = Tables<"tool_stock">;
// Ustada hazırda olan alət (açıq təhvil)
export type Holding = {
  id: number;
  tool_id: number;
  employee_id: number;
  quantity: number;
  taken_at: string;
  employees: { full_name: string; photo_url: string | null } | null;
};
export type DepotEmployee = Pick<Tables<"employees">, "id" | "full_name" | "photo_url" | "position" | "is_management" | "is_storekeeper" | "user_id">;

// Axtarış üçün sadələşdirmə: "Əlizadə" və "elizade" eyni tapılsın.
function norm(s: string | null | undefined) {
  return (s ?? "")
    .toLowerCase()
    .replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g");
}

function ToolFields({ t }: { t?: Tool }) {
  return (
    <>
      <Field label="Adı">
        <input name="name" defaultValue={t?.name} placeholder="Vakuum nasos" required className="field" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Say (ədəd)">
          <input name="quantity" type="number" min={0} step={1} defaultValue={t?.quantity ?? 1} required className="field" />
        </Field>
        <Field label="İnventar kodu">
          <input name="inventory_code" defaultValue={t?.inventory_code ?? ""} placeholder="İstəyə görə" className="field" />
        </Field>
      </div>
    </>
  );
}

// Sağ paneldəki "Yeni alət" kartı (yalnız depo məsulu və müdir)
export function AddToolCard() {
  const [state, action, pending] = useActionState(addTool, null);
  const ref = useRef<HTMLFormElement>(null);
  useOnSuccess(state, () => ref.current?.reset(), "Alət əlavə edildi");

  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-3">
        <span className="icon-tile !h-9 !w-9"><Plus size={18} /></span>
        <h2 className="card-title">Yeni alət</h2>
      </div>
      <ActionForm ref={ref} action={action} className="space-y-4">
        <ToolFields />
        <Buttons pending={pending} label="Əlavə et" />
      </ActionForm>
    </div>
  );
}

// Depo məsulları: hamı görür, yalnız müdir təyin edir və götürür
export function StorekeepersCard({ employees, owner, selfId }: { employees: DepotEmployee[]; owner: boolean; selfId: number | null }) {
  const keepers = employees.filter((e) => e.is_storekeeper);
  const [picked, setPicked] = useState<number | null>(null);
  // Müdir öz kartını dəyişə bilmir (baza qaydası), həm də onsuz da depoya yetkisi var
  const candidates = employees
    .filter((e) => !e.is_storekeeper && e.id !== selfId)
    .map((e) => ({ id: e.id, name: e.full_name, hint: e.is_management ? "rəhbər" : "usta" }));

  return (
    <div className="card space-y-3">
      <div className="flex items-center gap-3">
        <span className="icon-tile !h-9 !w-9"><ShieldCheck size={18} /></span>
        <h2 className="card-title">Depo məsulu</h2>
      </div>
      {keepers.length === 0 ? (
        <p className="muted text-sm">Təyin olunmayıb. Hələlik alətləri yalnız müdir dəyişir.</p>
      ) : (
        <ul className="space-y-1.5">
          {keepers.map((e) => (
            <li key={e.id} className="flex items-center gap-2.5 rounded-xl bg-bg px-2.5 py-2">
              <Avatar employee={e} className="!h-8 !w-8 !text-[11px]" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{e.full_name}</span>
                {/* Hesabı olmayan depo məsulu panelə daxil ola bilmir */}
                {!e.user_id && <span className="block text-[11px] font-semibold text-danger">Giriş hesabı yoxdur</span>}
              </span>
              {owner && (
                <ConfirmButton onConfirm={() => setStorekeeper(e.id, false)} success={false}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted hover:bg-danger-soft hover:text-danger"
                  title="Depo məsulluğunu götür" question={`${e.full_name} artıq alətləri dəyişə bilməyəcək.`} confirmLabel="Bəli, götür">
                  <X size={14} />
                </ConfirmButton>
              )}
            </li>
          ))}
        </ul>
      )}
      {owner && (
        <div className="flex gap-2">
          <ToolPicker items={candidates} value={picked} onChange={setPicked} name="employee_id" icon={Users}
            placeholder="Əməkdaş seç..." emptyLabel="Seçiləcək əməkdaş yoxdur" searchLabel="Əməkdaş axtar..." />
          <button type="button" disabled={!picked} className="btn btn-primary btn-sm !h-9"
            onClick={async () => { if (picked) { await setStorekeeper(picked, true); setPicked(null); } }}>
            <UserPlus size={14} /> Təyin et
          </button>
        </div>
      )}
    </div>
  );
}

// Alətlər cədvəli: ad, cəmi, ustalarda, depoda. Sətrə klik → alətin pəncərəsi.
export function ToolList({ tools, holdings, employees, canManage }: {
  tools: Tool[];
  holdings: Holding[];
  employees: DepotEmployee[];
  canManage: boolean;
}) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);
  const [view, setView] = useState<"tools" | "people">("tools");
  const [openEmp, setOpenEmp] = useState<number | null>(null);

  const toolById = useMemo(() => new Map(tools.map((t) => [t.id, t.name])), [tools]);
  const byEmployee = useMemo(() => {
    const m: Record<number, Holding[]> = {};
    for (const h of holdings) (m[h.employee_id] ??= []).push(h);
    return m;
  }, [holdings]);

  // Ustalar (rəhbərlik yox): ad və ya üzərindəki alətin adı ilə axtarış
  const masters = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    return employees.filter((e) => !e.is_management).filter((e) => {
      const names = (byEmployee[e.id] ?? []).map((h) => toolById.get(h.tool_id) ?? "").join(" ");
      const haystack = norm(`${e.full_name} ${names}`);
      return words.every((w) => haystack.includes(w));
    });
  }, [employees, query, byEmployee, toolById]);
  const openPerson = employees.find((e) => e.id === openEmp) ?? null;

  const byTool = useMemo(() => {
    const m: Record<number, Holding[]> = {};
    for (const h of holdings) (m[h.tool_id] ??= []).push(h);
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

  const open = tools.find((t) => t.id === openId) ?? null;

  if (tools.length === 0) {
    return (
      <div className="card py-12 text-center">
        <span className="icon-tile mx-auto"><Warehouse size={20} /></span>
        <p className="mt-3 font-semibold">Depoda hələ alət yoxdur</p>
        <p className="muted text-sm">{canManage ? "Sağdakı formdan ilk aləti əlavə et." : "Alətləri depo məsulu əlavə edir."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {open && <ToolModal tool={open} holders={byTool[open.id] ?? []} employees={employees} canManage={canManage} onClose={() => setOpenId(null)} />}

      <div className="search sticky top-0 z-10 rounded-[14px] shadow-[0_0_0_16px_#f8f9fc]">
        <Search size={20} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Alət və ya usta axtar..." aria-label="Alət axtar" />
      </div>

      {openPerson && (
        <PersonModal emp={openPerson} holds={byEmployee[openPerson.id] ?? []} toolById={toolById} canManage={canManage} onClose={() => setOpenEmp(null)} />
      )}

      <div className="inline-flex gap-1 rounded-xl bg-line/60 p-1" role="tablist">
        {([["tools", "Alətlər"], ["people", "Ustalar"]] as const).map(([v, label]) => (
          <button key={v} type="button" role="tab" aria-selected={view === v} onClick={() => setView(v)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${view === v ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
            {label}
          </button>
        ))}
      </div>

      {view === "people" ? (
        <div className="card overflow-hidden !p-0">
          <table className="w-full text-sm">
            <thead className="bg-[#f8f9fc] text-left text-xs font-semibold text-muted">
              <tr>
                <th className="px-4 py-3">Usta</th>
                <th className="px-4 py-3">Üzərindəki alətlər</th>
                <th className="w-24 px-4 py-3 text-center">Ədəd</th>
              </tr>
            </thead>
            <tbody>
              {masters.map((e) => {
                const holds = byEmployee[e.id] ?? [];
                const total = holds.reduce((n, h) => n + h.quantity, 0);
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
                      <span className="block truncate text-[13px]" title={holds.map((h) => toolById.get(h.tool_id)).join(", ")}>
                        {holds.length === 0 ? <span className="muted">Alət yoxdur</span>
                          : holds.map((h) => `${toolById.get(h.tool_id) ?? "—"}${h.quantity > 1 ? ` ×${h.quantity}` : ""}`).join(", ")}
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
              <th className="px-4 py-3">Alət</th>
              <th className="w-24 px-4 py-3 text-center">Cəmi</th>
              <th className="w-24 px-4 py-3 text-center">Ustalarda</th>
              <th className="w-24 px-4 py-3 text-center">Depoda</th>
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
                <td className="px-4 py-3 text-center font-semibold tabular-nums">{t.quantity}</td>
                <td className="px-4 py-3 text-center tabular-nums">{t.given_out || <span className="muted">—</span>}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block min-w-8 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
                    t.available ? "bg-ok-soft text-ok" : "bg-danger-soft text-danger"}`}>
                    {t.available}
                  </span>
                </td>
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

// Ustanın pəncərəsi: üzərində hansı alət neçə ədəd var (geri almaq da olur)
function PersonModal({ emp, holds, toolById, canManage, onClose }: {
  emp: DepotEmployee;
  holds: Holding[];
  toolById: Map<number, string>;
  canManage: boolean;
  onClose: () => void;
}) {
  const total = holds.reduce((n, h) => n + h.quantity, 0);
  return (
    <Modal onClose={onClose} labelledBy={`emp-${emp.id}-title`} className="!max-w-xl">
      <div className="flex items-center gap-3">
        <Avatar employee={emp} className="!h-11 !w-11 !text-sm" />
        <div className="min-w-0 flex-1">
          <h2 id={`emp-${emp.id}-title`} className="truncate text-xl font-bold">{emp.full_name}</h2>
          <p className="muted text-sm">{total ? `Üzərində ${total} ədəd alət var` : "Üzərində alət yoxdur"}</p>
        </div>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>
      {holds.length > 0 && (
        <ul className="nice-scroll mt-4 max-h-[min(433px,calc(100vh-260px))] divide-y divide-line overflow-y-auto">
          {holds.map((h) => <HolderRow key={h.id} holding={h} canManage={canManage} toolName={toolById.get(h.tool_id) ?? "—"} />)}
        </ul>
      )}
    </Modal>
  );
}

// Ustadakı alət: "Geri al". Ustada 1 ədəddirsə dərhal, çoxdursa neçə ədəd olduğu soruşulur.
// toolName verilirsə: usta pəncərəsində (sətirdə usta yox, alətin adı göstərilir)
function HolderRow({ holding, canManage, toolName }: { holding: Holding; canManage: boolean; toolName?: string }) {
  const [asking, setAsking] = useState(false);
  const [state, action, pending] = useActionState(
    async (_prev: Awaited<ReturnType<typeof returnTool>>, fd: FormData) => {
      const qty = Number(fd.get("quantity") ?? holding.quantity);
      if (qty > holding.quantity) return { error: `Ustada cəmi ${holding.quantity} ədəd var.` };
      return returnTool(holding.id, qty);
    },
    null,
  );
  useOnSuccess(state, () => setAsking(false), "Geri alındı");

  return (
    <li className="flex items-center gap-3 py-2">
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
      <span className="text-sm font-bold tabular-nums text-primary">{holding.quantity} ədəd</span>
      {canManage && (
        <ActionForm action={action} className="flex items-center gap-1.5">
          {asking && (
            <QuantityInput limit={holding.quantity} defaultValue={holding.quantity} className="!h-8 !w-16"
              limitText={(limit) => `Ustada cəmi ${limit} ədəd var.`} />
          )}
          {holding.quantity > 1 && !asking ? (
            <button type="button" onClick={() => setAsking(true)} className="btn btn-secondary btn-sm !h-8">Geri al</button>
          ) : (
            <button type="submit" disabled={pending} className="btn btn-secondary btn-sm !h-8">{pending ? "..." : "Geri al"}</button>
          )}
        </ActionForm>
      )}
    </li>
  );
}

function GiveForm({ tool, employees }: { tool: Tool; employees: DepotEmployee[] }) {
  const [state, action, pending] = useActionState(giveTool, null);
  const [picked, setPicked] = useState<number | null>(null);
  const [formKey, setFormKey] = useState(0);
  useOnSuccess(state, () => { setPicked(null); setFormKey((k) => k + 1); }, "Verildi");
  // Alət yalnız ustaya verilir (rəhbərlik siyahıda yoxdur; bazada da trigger yoxlayır)
  const items = employees.filter((e) => !e.is_management).map((e) => ({ id: e.id, name: e.full_name }));

  // Göndərməzdən əvvəl də yoxla: say depodakından çoxdursa, sorğu getmir, tost çıxır
  function submit(fd: FormData) {
    const wanted = Number(fd.get("quantity"));
    if (wanted > tool.available) {
      toast.error(giveLimitText(tool.available, wanted));
      return;
    }
    action(fd);
  }

  if (tool.available === 0) {
    return <p className="muted text-center text-sm">Depoda boş ədəd yoxdur. Vermək üçün əvvəl geri alın və ya sayı artırın.</p>;
  }
  return (
    <ActionForm key={formKey} action={submit} className="flex gap-2 pb-4">
      <input type="hidden" name="tool_id" value={tool.id} />
      <ToolPicker items={items} value={picked} onChange={setPicked} name="employee_id" icon={Users}
        placeholder="Kimə verilir?" emptyLabel="Aktiv əməkdaş yoxdur" searchLabel="Usta axtar..." />
      <QuantityInput limit={tool.available} limitText={giveLimitText} />
      <button type="submit" disabled={pending || !picked} className="btn btn-primary btn-sm !h-9">{pending ? "..." : "Ver"}</button>
    </ActionForm>
  );
}

function EditToolModal({ tool, onClose }: { tool: Tool; onClose: () => void }) {
  const [state, action, pending] = useActionState(updateTool.bind(null, tool.id), null);
  useOnSuccess(state, onClose);

  // Say ustalardakından az ola bilməz: dərhal bildir
  function submit(fd: FormData) {
    const qty = Number(fd.get("quantity"));
    if (qty < tool.given_out) {
      toast.error(`Ustalarda ${tool.given_out} ədəd var — say ən azı ${tool.given_out} olmalıdır.`);
      return;
    }
    action(fd);
  }

  return (
    <Modal onClose={onClose} labelledBy="edit-tool-title" className="!max-w-md">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 id="edit-tool-title" className="text-lg font-bold">Aləti redaktə et</h2>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>
      <SaveConfirmForm action={submit} className="space-y-4">
        <ToolFields t={tool} />
        <Buttons pending={pending} label="Yadda saxla" onCancel={onClose} />
      </SaveConfirmForm>
    </Modal>
  );
}

function ToolModal({ tool, holders, employees, canManage, onClose }: {
  tool: Tool;
  holders: Holding[];
  employees: DepotEmployee[];
  canManage: boolean;
  onClose: () => void;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <Modal onClose={onClose} labelledBy={`tool-${tool.id}-title`} className="!max-w-xl">
      {editing && <EditToolModal tool={tool} onClose={() => setEditing(false)} />}
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h2 id={`tool-${tool.id}-title`} className="truncate text-xl font-bold">{tool.name}</h2>
          <p className="mt-1 text-sm">
            Cəmi <b>{tool.quantity}</b> · ustalarda <b className="text-primary">{tool.given_out}</b> · depoda{" "}
            <b className={tool.available ? "text-ok" : "text-danger"}>{tool.available}</b>
          </p>
        </div>
        {canManage && (
          <>
            <button type="button" onClick={() => setEditing(true)} className="icon-btn" title="Redaktə et" aria-label="Redaktə et"><Pencil size={16} /></button>
            {/* Ustalarda olan alət silinmir: əvvəl geri alınmalıdır */}
            {tool.given_out ? (
              <button type="button" className="icon-btn" title="Aləti sil" aria-label="Aləti sil"
                onClick={() => toast.error(`Ustalarda ${tool.given_out} ədəd var — silmək üçün əvvəl geri alın.`)}>
                <Trash2 size={16} />
              </button>
            ) : (
              <ConfirmButton onConfirm={() => deleteTool(tool.id)} success={false} className="icon-btn icon-btn-danger" title="Aləti sil">
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
          {holders.map((h) => <HolderRow key={h.id} holding={h} canManage={canManage} />)}
        </ul>
      )}

      {canManage && (
        <div className="mt-4 border-t border-line pt-4">
          <GiveForm tool={tool} employees={employees} />
        </div>
      )}
    </Modal>
  );
}
