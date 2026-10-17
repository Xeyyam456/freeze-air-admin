
import { useActionState, useMemo, useRef, useState } from "react";
import { Briefcase, CalendarDays, ClipboardList, KeyRound, Pencil, Phone, Plus, Search, Trash2, User, Users, Wrench, X } from "lucide-react";
import { createEmployeeAccount, deleteEmployeeAccount, resetEmployeePassword } from "@/actions/accounts";
import { addEmployee, deleteEmployee, updateEmployee } from "@/actions/employees";
import { giveTool, returnTool } from "@/actions/tools";
import { ConfirmButton } from "@/components/ConfirmButton";
import { AvatarUpload } from "./AvatarUpload";
import { DatePicker } from "@/components/DatePicker";
import { ActionForm, Buttons, Field, SaveConfirmForm, useOnSuccess } from "@/components/forms";
import { Modal } from "@/components/Modal";
import { giveLimitText, QuantityInput } from "@/components/QuantityInput";
import { ToolPicker } from "@/components/ToolPicker";
import { WorkTab } from "@/components/work/WorkTab";
import type { Tables } from "@/lib/database.types";
import { experience, initials } from "@/lib/experience";
import { toast } from "@/lib/toast";

type Employee = Tables<"employees">;

// Ustada hazırda olan alət (açıq təhvil): assignmentId — geri almaq üçün, quantity — ustadakı say
export type HeldTool = { assignmentId: number; id: number; name: string; inventory_code: string | null; taken_at: string; quantity: number };
// Depoda boş ədədi olan alət
export type FreeTool = { id: number; name: string; available: number };
// Ustaların giriş hesabları: enabled — gizli açar qurulubmu; emails — usta id → e-poçt
export type Accounts = { enabled: boolean; emails: Record<number, string> };

// Axtarış üçün sadələşdirmə: "Əlizadə" və "elizade" eyni tapılsın.
function norm(s: string | null | undefined) {
  return (s ?? "")
    .toLowerCase()
    .replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g");
}

function EmployeeFields({ e }: { e?: Employee }) {
  return (
    <>
      <Field label="Soyad və ad">
        <input name="full_name" defaultValue={e?.full_name} placeholder="Məmmədov Əli" required className="field" />
      </Field>
      <Field label="İxtisas">
        <input name="specialty" defaultValue={e?.specialty ?? ""} placeholder="Kondisioner ustası" className="field" list="specialties" />
      </Field>
      <datalist id="specialties">
        <option value="Kondisioner ustası" />
        <option value="Soyuducu ustası" />
        <option value="Elektrik" />
        <option value="Ventilyasiya ustası" />
        <option value="Köməkçi usta" />
      </datalist>
      <div className="grid grid-cols-2 gap-3">
        <Field label="İşə başlama tarixi">
          <DatePicker name="start_date" defaultValue={e?.start_date} placeholder="Seçilməyib" />
        </Field>
        <Field label="Telefon">
          <input name="phone" defaultValue={e?.phone ?? ""} placeholder="+994 50 000 00 00" className="field" />
        </Field>
      </div>
    </>
  );
}

// Sağ paneldəki "Yeni usta" kartı
export function AddEmployeeCard() {
  const [state, action, pending] = useActionState(addEmployee, null);
  const ref = useRef<HTMLFormElement>(null);
  // Təqvim öz vəziyyətini saxlayır, form.reset() onu təmizləmir: uğurdan sonra sahələri yenidən yaradırıq
  const [formKey, setFormKey] = useState(0);
  useOnSuccess(state, () => {
    ref.current?.reset();
    setFormKey((k) => k + 1);
  }, "Usta əlavə edildi");

  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-3">
        <span className="icon-tile !h-9 !w-9"><Plus size={18} /></span>
        <h2 className="card-title">Yeni usta</h2>
      </div>
      <ActionForm ref={ref} action={action} className="space-y-4">
        <EmployeeFields key={formKey} />
        <Buttons pending={pending} label="Ustanı əlavə et" />
      </ActionForm>
    </div>
  );
}

function EditEmployeeModal({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const [state, action, pending] = useActionState(updateEmployee.bind(null, employee.id), null);
  useOnSuccess(state, onClose);

  return (
    <Modal onClose={onClose} labelledBy="edit-employee-title" className="!max-w-lg">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar employee={employee} className="!h-11 !w-11 !text-sm" />
          <div>
            <h2 id="edit-employee-title" className="text-lg font-bold">Ustanı redaktə et</h2>
            <p className="muted text-sm">{employee.full_name}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla">
          <X size={18} />
        </button>
      </div>
      <div className="mb-4"><AvatarUpload employee={employee} /></div>
      <SaveConfirmForm action={action} className="space-y-4">
        <EmployeeFields e={employee} />
        <Buttons pending={pending} label="Yadda saxla" onCancel={onClose} />
      </SaveConfirmForm>
    </Modal>
  );
}

// Şəkil varsa şəkil, yoxdursa baş hərflər
export function Avatar({ employee, className = "" }: { employee: Pick<Employee, "full_name" | "photo_url">; className?: string }) {
  if (employee.photo_url) {
    return <img src={employee.photo_url} alt={employee.full_name} className={`emp-avatar object-cover ${className}`} />;
  }
  return <span className={`emp-avatar ${className}`}>{initials(employee.full_name)}</span>;
}

export function formatDate(d: string | null) {
  if (!d) return null;
  const [y, m, day] = d.split("-");
  return `${day}.${m}.${y}`;
}

// Usta kartına klikləyəndə açılan məlumat pəncərəsi
function EmployeeDetailsModal({ employee, tools, freeTools, accounts, admin, canManageTools, onClose }: {
  accounts: Accounts;
  canManageTools: boolean;
  employee: Employee;
  tools: HeldTool[];
  freeTools: FreeTool[];
  admin: boolean;
  onClose: () => void;
}) {
  const exp = experience(employee.start_date);
  const [tab, setTab] = useState<"about" | "tools" | "work">("about");

  const tabClass = (t: typeof tab) =>
    `flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-colors ${
      tab === t ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
    }`;

  return (
    <Modal onClose={onClose} labelledBy={`emp-${employee.id}-title`} className="!max-w-2xl overflow-hidden !p-0">
      {/* Başlıq zolağı: header ilə eyni rəng keçidi, şəkil zolağın üstünə çıxır */}
      <div className="relative h-24 bg-[linear-gradient(120deg,#0a1a33,#0f2a55_55%,#0e3b6e)]">
        <button type="button" onClick={onClose} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white" aria-label="Bağla">
          <X size={18} />
        </button>
      </div>
      <div className="relative -mt-12 px-6 pb-6 text-center">
        <Avatar employee={employee} className="mx-auto !h-24 !w-24 !text-2xl ring-4 ring-white" />
        <h2 id={`emp-${employee.id}-title`} className="mt-3 text-xl font-bold">{employee.full_name}</h2>
        <p className="muted text-sm">{employee.specialty ?? "İxtisas yazılmayıb"}</p>

        <div className="mt-5 flex gap-1 rounded-xl bg-bg p-1" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "about"} onClick={() => setTab("about")} className={tabClass("about")}>
            <User size={15} /> Haqqında
          </button>
          <button type="button" role="tab" aria-selected={tab === "tools"} onClick={() => setTab("tools")} className={tabClass("tools")}>
            <Wrench size={15} /> Alətlər
            <span className="rounded-full bg-primary-soft px-1.5 text-xs text-primary">{toolCount(tools)}</span>
          </button>
          <button type="button" role="tab" aria-selected={tab === "work"} onClick={() => setTab("work")} className={tabClass("work")}>
            <ClipboardList size={15} /> İşlər
          </button>
        </div>

        {/* Bütün tablar eyni hündürlükdədir ki, keçid zamanı pəncərə tullanmasın */}
        <div className="mt-3 h-[min(340px,calc(100vh-330px))] text-left text-sm">
        {tab === "about" ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-bg px-3 py-2">
            <p className="muted flex items-center gap-1.5 text-xs font-medium"><Briefcase size={13} /> Təcrübə</p>
            <p className="font-semibold">{exp ?? "—"}</p>
          </div>
          <div className="rounded-xl bg-bg px-3 py-2">
            <p className="muted flex items-center gap-1.5 text-xs font-medium"><CalendarDays size={13} /> İşə başlayıb</p>
            <p className="font-semibold">{formatDate(employee.start_date) ?? "—"}</p>
          </div>
          <div className="col-span-2 rounded-xl bg-bg px-3 py-2">
            <p className="muted flex items-center gap-1.5 text-xs font-medium"><Phone size={13} /> Telefon</p>
            {employee.phone
              ? <a href={`tel:${employee.phone}`} className="link">{employee.phone}</a>
              : <p className="font-semibold">—</p>}
          </div>
          {admin && (
            <div className="col-span-2">
              <AccountSection employeeId={employee.id} email={accounts.emails[employee.id] ?? null}
                hasAccount={!!employee.user_id} enabled={accounts.enabled} />
            </div>
          )}
        </div>
        ) : tab === "tools" ? (
          <ToolsTab employeeId={employee.id} tools={tools} freeTools={freeTools} canManage={canManageTools} />
        ) : (
          <WorkTab employeeId={employee.id} employeeName={employee.full_name} admin={admin} />
        )}
        </div>
      </div>
    </Modal>
  );
}

// Ustanın giriş hesabı (yalnız admin görür): hesab aç, parolu dəyiş, hesabı sil
export function AccountSection({ employeeId, email, hasAccount, enabled, note = "Hesab açılanda usta mobil tətbiqdən öz işlərini əlavə edə biləcək." }: {
  note?: string;
  employeeId: number;
  email: string | null;
  hasAccount: boolean;
  enabled: boolean;
}) {
  const [mode, setMode] = useState<"view" | "password">("view");
  const [createState, createAction, creating] = useActionState(createEmployeeAccount.bind(null, employeeId), null);
  const [pwState, pwAction, changing] = useActionState(resetEmployeePassword.bind(null, employeeId), null);
  useOnSuccess(pwState, () => setMode("view"), "Parol dəyişdirildi");
  useOnSuccess(createState, undefined, "Giriş hesabı açıldı");

  const box = "rounded-xl border border-line px-3 py-2.5";
  const title = <p className="flex items-center gap-1.5 text-xs font-semibold"><KeyRound size={13} className="text-primary" /> Giriş hesabı</p>;

  if (!enabled) {
    return (
      <div className={box}>
        {title}
        <p className="muted mt-1 text-xs">
          Hesab funksiyası hələ qoşulmayıb: <code>web/.env.local</code> faylına <code>SUPABASE_SECRET_KEY</code> əlavə et və serveri yenidən başlat.
        </p>
      </div>
    );
  }

  if (hasAccount) {
    return (
      <div className={box}>
        <div className="flex items-center justify-between gap-2">
          {title}
          <span className="rounded-full bg-ok-soft px-2 py-0.5 text-[11px] font-semibold text-ok">Aktiv</span>
        </div>
        <p className="mt-1 truncate text-sm font-semibold">{email ?? "—"}</p>
        {mode === "password" ? (
          <ActionForm action={pwAction} className="mt-2 flex gap-2">
            <input name="password" type="password" minLength={8} required placeholder="Yeni parol (ən azı 8 simvol)"
              autoComplete="new-password" className="field !h-9 flex-1 !text-[13px]" />
            <button type="submit" disabled={changing} className="btn btn-primary btn-sm !h-9">{changing ? "..." : "Saxla"}</button>
            <button type="button" onClick={() => setMode("view")} className="btn btn-cancel btn-sm !h-9">Ləğv et</button>
          </ActionForm>
        ) : (
          <div className="mt-2 flex items-center gap-2">
            <button type="button" onClick={() => setMode("password")} className="btn btn-secondary btn-sm">Parolu dəyiş</button>
            <ConfirmButton onConfirm={() => deleteEmployeeAccount(employeeId)} className="btn btn-sm btn-cancel"
              title="Hesabı sil" question="Usta artıq sistemə daxil ola bilməyəcək. İşləri və alət tarixçəsi silinmir.">
              Hesabı sil
            </ConfirmButton>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={box}>
      {title}
      <p className="muted mt-0.5 text-xs">{note}</p>
      <ActionForm action={createAction} className="mt-2 grid grid-cols-[1fr_1fr_auto] gap-2">
        <input name="email" type="email" required placeholder="E-poçt" autoComplete="off" className="field !h-9 !text-[13px]" />
        <input name="password" type="password" minLength={8} required placeholder="Parol (ən azı 8)" autoComplete="new-password"
          className="field !h-9 !text-[13px]" />
        <button type="submit" disabled={creating} className="btn btn-primary btn-sm !h-9">{creating ? "..." : "Hesab aç"}</button>
      </ActionForm>
    </div>
  );
}

// Ustadakı ədədlərin cəmi
function toolCount(tools: HeldTool[]) {
  return tools.reduce((s, t) => s + t.quantity, 0);
}

// Alətlər tabı: ustadakı alətlər və sayı; depo məsulu və müdir aləti geri ala (×) və depodan verə bilir.
// Hissə-hissə geri almaq Depo səhifəsindədir; burada × hamısını qaytarır.
function ToolsTab({ employeeId, tools, freeTools, canManage }: {
  employeeId: number;
  tools: HeldTool[];
  freeTools: FreeTool[];
  canManage: boolean;
}) {
  const [state, action, pending] = useActionState(giveTool, null);
  const [picked, setPicked] = useState<number | null>(null);
  const [formKey, setFormKey] = useState(0);
  useOnSuccess(state, () => { setPicked(null); setFormKey((k) => k + 1); }, "Alət verildi");
  const pickedTool = freeTools.find((t) => t.id === picked);

  // Say depodakından çoxdursa sorğu getmir, dərhal tost çıxır
  function submit(fd: FormData) {
    const wanted = Number(fd.get("quantity"));
    if (pickedTool && wanted > pickedTool.available) {
      toast.error(giveLimitText(pickedTool.available, wanted));
      return;
    }
    action(fd);
  }

  return (
    <div className="flex h-full flex-col gap-2">
      {tools.length === 0 ? (
        <div className="grid flex-1 place-items-center rounded-xl border border-dashed border-line">
          <p className="muted text-sm">Ustanın üzərində alət yoxdur.</p>
        </div>
      ) : (
        // Üç sütun: çox alət olanda da sahə öz içində sürüşür, pəncərə böyümür
        <ul className="grid min-h-0 flex-1 auto-rows-min grid-cols-3 gap-1.5 overflow-y-auto">
          {tools.map((t) => (
            <li key={t.assignmentId} className="flex items-center gap-2 rounded-lg bg-bg py-1.5 pl-3 pr-1.5 text-[13px] font-medium" title={t.name}>
              <Wrench size={13} className="shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate">{t.name}</span>
              {t.quantity > 1 && <span className="shrink-0 rounded-full bg-primary-soft px-1.5 text-xs font-bold text-primary">×{t.quantity}</span>}
              {canManage && (
                <ConfirmButton
                  onConfirm={async () => {
                    const r = await returnTool(t.assignmentId, t.quantity);
                    if (r?.error) toast.error(r.error);
                    else toast.success("Alət geri alındı");
                  }}
                  success={false}
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-muted hover:bg-danger-soft hover:text-danger"
                  title="Aləti ustadan geri al"
                  question={`"${t.name}"${t.quantity > 1 ? ` (${t.quantity} ədəd)` : ""} depoya qaytarılacaq və başqa ustaya vermək olacaq.`}
                  confirmLabel="Bəli, geri al"
                >
                  <X size={14} />
                </ConfirmButton>
              )}
            </li>
          ))}
        </ul>
      )}

      {canManage && (
        <ActionForm key={formKey} action={submit} className="flex shrink-0 gap-2">
          <input type="hidden" name="employee_id" value={employeeId} />
          <ToolPicker items={freeTools.map((t) => ({ id: t.id, name: t.name, hint: `depoda ${t.available}` }))} value={picked} onChange={setPicked} />
          {/* Alət dəyişəndə say sahəsi yenidən yaranır ki, köhnə xəta qalmasın */}
          <QuantityInput key={picked ?? 0} limit={pickedTool?.available ?? Infinity} limitText={giveLimitText} className="!w-16" />
          <button type="submit" disabled={pending || !picked} className="btn btn-primary btn-sm !h-9">
            <Plus size={14} /> {pending ? "..." : "Alət ver"}
          </button>
        </ActionForm>
      )}
    </div>
  );
}

function EmployeeCard({ employee, tools, todayCount, freeTools, accounts, admin, canManageTools }: {
  accounts: Accounts;
  canManageTools: boolean;
  todayCount: number;
  employee: Employee;
  tools: HeldTool[];
  freeTools: FreeTool[];
  admin: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [viewing, setViewing] = useState(false);
  const exp = experience(employee.start_date);

  return (
    <>
      {/* Modallar kartın çölündədir: içlərindəki kliklər karta keçib detalları yenidən açmasın */}
      {viewing && <EmployeeDetailsModal employee={employee} tools={tools} freeTools={freeTools} accounts={accounts} admin={admin} canManageTools={canManageTools} onClose={() => setViewing(false)} />}
      {editing && <EditEmployeeModal employee={employee} onClose={() => setEditing(false)} />}

    {/* Kartın istənilən yerinə klik məlumat pəncərəsini açır */}
    <div
      className="store-card cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label={`${employee.full_name}: məlumatlara bax`}
      onClick={() => setViewing(true)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && e.target === e.currentTarget && setViewing(true)}
    >
      <div className="flex gap-4">
        <Avatar employee={employee} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-bold">{employee.full_name}</h3>
              <p className="muted text-[13px]">{employee.specialty ?? "İxtisas yazılmayıb"}</p>
            </div>
            {admin && (
              // Redaktə/sil kliki karta keçməsin (yoxsa detallar da açılar)
              <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                <button type="button" onClick={() => setEditing(true)} className="icon-btn" title="Redaktə et" aria-label="Redaktə et">
                  <Pencil size={16} />
                </button>
                <ConfirmButton onConfirm={() => deleteEmployee(employee.id)} className="icon-btn icon-btn-danger" title="Ustanı sil">
                  <Trash2 size={16} />
                </ConfirmButton>
              </div>
            )}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-[13px]">
            <Phone size={14} className="muted shrink-0" />
            {employee.phone
              ? <a href={`tel:${employee.phone}`} className="link" onClick={(e) => e.stopPropagation()}>{employee.phone}</a>
              : <span className="muted">Telefon yoxdur</span>}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-dashed border-line pt-3 text-xs font-semibold">
        <span className="flex items-center gap-2">
          <Briefcase size={14} className="text-primary" />
          {exp ? <span>Təcrübə: {exp}</span> : <span className="muted">İşə başlama tarixi yazılmayıb</span>}
        </span>
        <span className="flex shrink-0 items-center gap-3">
          <span className={`flex items-center gap-1.5 ${todayCount ? "text-ok" : "muted"}`} title="Bu gün yazılan işlər">
            <ClipboardList size={13} /> Bu gün: {todayCount} iş
          </span>
          <span className={`flex items-center gap-1.5 ${tools.length ? "text-primary" : "muted"}`}>
            <Wrench size={13} /> {toolCount(tools)} alət
          </span>
        </span>
      </div>
    </div>
    </>
  );
}

export function EmployeeList({ employees, toolsByEmployee, todayWork, freeTools, accounts, admin, canManageTools }: {
  accounts: Accounts;
  canManageTools: boolean;
  todayWork: Record<number, number>; // usta id → bu gün yazılan iş sayı
  employees: Employee[];
  toolsByEmployee: Record<number, HeldTool[]>;
  freeTools: FreeTool[];
  admin: boolean;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    return employees.filter((e) => {
      const haystack = norm(`${e.full_name} ${e.specialty} ${e.phone}`);
      return words.every((w) => haystack.includes(w));
    });
  }, [employees, query]);

  if (employees.length === 0) {
    return (
      <div className="card py-12 text-center">
        <span className="icon-tile mx-auto"><Users size={20} /></span>
        <p className="mt-3 font-semibold">Hələ usta yoxdur</p>
        <p className="muted text-sm">Sağdakı formdan ilk ustanı əlavə et.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="search sticky top-0 z-10 rounded-[14px] shadow-[0_0_0_16px_#f8f9fc]">
        <Search size={20} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ad, ixtisas və ya telefon ilə axtar..."
          aria-label="Usta axtarışı"
        />
      </div>
      {filtered.length === 0 ? (
        <div className="card muted py-10 text-center text-sm">Bu axtarışa uyğun usta tapılmadı.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((e) => <EmployeeCard key={e.id} employee={e} tools={toolsByEmployee[e.id] ?? []} todayCount={todayWork[e.id] ?? 0} freeTools={freeTools} accounts={accounts} admin={admin} canManageTools={canManageTools} />)}
        </div>
      )}
    </div>
  );
}
