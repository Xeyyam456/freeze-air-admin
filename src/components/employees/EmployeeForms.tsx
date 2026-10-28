
import { urlQuery } from "@/lib/urlQuery";
import { useActionState, useMemo, useState } from "react";
import { Briefcase, CalendarDays, Car, Fuel, ClipboardList, KeyRound, Pencil, Phone, Plus, Search, Trash2, User, Users, X } from "lucide-react";
import { createEmployeeAccount, deleteEmployeeAccount, resetEmployeePassword } from "@/actions/accounts";
import { addEmployee, deleteEmployee, updateEmployee } from "@/actions/employees";
import { ConfirmButton } from "@/components/ConfirmButton";
import { AvatarUpload } from "./AvatarUpload";
import { PersonCard, type PersonStatus } from "./PersonCard";
import { DatePicker } from "@/components/DatePicker";
import { ActionForm, Buttons, Field, SaveConfirmForm, useOnSuccess } from "@/components/forms";
import { Modal } from "@/components/Modal";
import { WorkTab } from "@/components/work/WorkTab";
import type { Tables } from "@/types/database";
import { experience, initials } from "@/lib/experience";

type Employee = Tables<"employees">;
export type TodayStatus = PersonStatus;

// Ustaların giriş hesabları: enabled — gizli açar qurulubmu; emails — usta id → e-poçt
export type Accounts = { enabled: boolean; emails: Record<number, string> };

// Axtarış üçün sadələşdirmə: "Əlizadə" və "elizade" eyni tapılsın.
function norm(s: string | null | undefined) {
  return (s ?? "")
    .toLowerCase()
    .replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g");
}

// İş növü: işə qəbul zamanı seçilir (bazada employees.worker_type; saytın "Ustalarımız" səhifəsi növə görə sayır)
export const WORKER_TYPES = [
  { value: "master", label: "Usta" },
  { value: "assistant", label: "Köməkçi" },
  { value: "driver", label: "Sürücü" },
] as const;

export function workerTypeLabel(type: string | null | undefined) {
  return WORKER_TYPES.find((w) => w.value === type)?.label ?? "Usta";
}

// Üç seçim olduğu üçün açılan siyahı yox, keçid düymələri (seçim gizli sahədə göndərilir)
function WorkerTypeField({ defaultValue = "master" }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <Field label="İş növü">
      <input type="hidden" name="worker_type" value={value} />
      <div className="seg w-full" role="radiogroup" aria-label="İş növü">
        {WORKER_TYPES.map((w) => (
          <button key={w.value} type="button" role="radio" aria-checked={value === w.value} aria-selected={value === w.value}
            onClick={() => setValue(w.value)} className="!h-9 !w-auto flex-1 text-sm font-semibold">
            {w.label}
          </button>
        ))}
      </div>
    </Field>
  );
}

// Maşın (0076): "Yoxdur / Var"; var olanda nömrə (məcburi) və marka/model (istəyə görə, gələcəkdə benzin hesabı üçün)
function CarFields({ e }: { e?: Employee }) {
  const [hasCar, setHasCar] = useState(e?.has_car ?? false);
  // Yanacaq növü (0079): hesab bu növün qiyməti ilə aparılır, ona görə maşın varsa mütləq seçilir (standart benzin)
  const [fuel, setFuel] = useState<"petrol" | "diesel">(e?.fuel_type === "diesel" ? "diesel" : "petrol");
  const opt = (on: boolean, label: string) => (
    <button type="button" onClick={() => setHasCar(on)} aria-pressed={hasCar === on}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm font-semibold transition-colors ${
        hasCar === on ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
      {on && <Car size={14} />} {label}
    </button>
  );
  return (
    <div className="space-y-2">
      <input type="hidden" name="car_form" value="1" />
      <input type="hidden" name="has_car" value={hasCar ? "1" : "0"} />
      <span className="label">Maşın</span>
      <div className="flex gap-1 rounded-xl bg-bg p-1">{opt(false, "Yoxdur")}{opt(true, "Var")}</div>
      {hasCar && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Maşın nömrəsi">
            <input name="car_plate" defaultValue={e?.car_plate ?? ""} placeholder="10-AB-123" required className="field uppercase" />
          </Field>
          <Field label="Marka, model">
            <input name="car_model" defaultValue={e?.car_model ?? ""} placeholder="Toyota Prius" className="field" />
          </Field>
          <div>
            <span className="label">Yanacaq</span>
            <input type="hidden" name="fuel_type" value={fuel} />
            <div className="flex h-[42px] gap-1 rounded-xl bg-bg p-1" role="radiogroup" aria-label="Yanacaq növü">
              {(["petrol", "diesel"] as const).map((k) => (
                <button key={k} type="button" role="radio" aria-checked={fuel === k} onClick={() => setFuel(k)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    fuel === k ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
                  <Fuel size={14} className={fuel === k ? (k === "diesel" ? "text-amber-600" : "text-primary") : ""} /> {k === "petrol" ? "Benzin" : "Dizel"}
                </button>
              ))}
            </div>
          </div>
          <Field label="100 km-ə sərf (litr)">
            <input name="fuel_per_100" defaultValue={e?.fuel_per_100 ?? ""} inputMode="decimal" placeholder="8" className="field" />
          </Field>
        </div>
      )}
    </div>
  );
}

function EmployeeFields({ e }: { e?: Employee }) {
  return (
    <>
      <WorkerTypeField defaultValue={e?.worker_type} />
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
      <CarFields e={e} />
    </>
  );
}

// "Yeni usta": başlıqdakı düymə pəncərə açır (Şirkətlər kimi), siyahı bütün eni tutur
function AddEmployeeForm({ onDone }: { onDone: () => void }) {
  const [state, action, pending] = useActionState(addEmployee, null);
  useOnSuccess(state, onDone, "Usta əlavə edildi");
  return (
    <ActionForm action={action} className="space-y-4">
      <EmployeeFields />
      <Buttons pending={pending} label="Ustanı əlavə et" />
    </ActionForm>
  );
}

export function AddEmployeeButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="hero-action">
        <Plus size={17} /> Yeni usta
      </button>
      {open && (
        <Modal onClose={() => setOpen(false)} labelledBy="add-employee-title" className="!max-w-lg">
          <div className="mb-5 flex items-center gap-3">
            <span className="icon-tile !h-10 !w-10"><Plus size={18} /></span>
            <h2 id="add-employee-title" className="card-title">Yeni usta</h2>
          </div>
          <AddEmployeeForm onDone={() => setOpen(false)} />
        </Modal>
      )}
    </>
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
function EmployeeDetailsModal({ employee, accounts, admin, onClose }: {
  accounts: Accounts;
  employee: Employee;
  admin: boolean;
  onClose: () => void;
}) {
  const exp = experience(employee.start_date);
  const [tab, setTab] = useState<"about" | "work">("about");

  const tabClass = (t: typeof tab) =>
    `flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-colors ${
      tab === t ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
    }`;

  return (
    <Modal onClose={onClose} labelledBy={`emp-${employee.id}-title`} className="!max-w-2xl overflow-hidden !p-0">
      {/* Başlıq zolağı: header ilə eyni rəng keçidi, şəkil zolağın üstünə çıxır */}
      <div className="relative h-24 bg-[linear-gradient(120deg,#0b1324,#11243a_55%,#0f3d4c)]">
        <button type="button" onClick={onClose} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white" aria-label="Bağla">
          <X size={18} />
        </button>
      </div>
      <div className="relative -mt-12 px-6 pb-6 text-center">
        <Avatar employee={employee} className="mx-auto !h-24 !w-24 !text-2xl ring-4 ring-white" />
        <h2 id={`emp-${employee.id}-title`} className="mt-3 text-xl font-bold">{employee.full_name}</h2>
        <p className="muted text-sm"><span className="mr-1.5 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">{workerTypeLabel(employee.worker_type)}</span>{employee.specialty ?? "İxtisas yazılmayıb"}</p>

        <div className="mt-5 flex gap-1 rounded-xl bg-bg p-1" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "about"} onClick={() => setTab("about")} className={tabClass("about")}>
            <User size={15} /> Haqqında
          </button>
          <button type="button" role="tab" aria-selected={tab === "work"} onClick={() => setTab("work")} className={tabClass("work")}>
            <ClipboardList size={15} /> İşlər
          </button>
        </div>

        {/* Bütün tablar eyni hündürlükdədir ki, keçid zamanı pəncərə tullanmasın */}
        <div className="mt-3 h-[min(340px,calc(100vh/var(--zoom)-330px))] text-left text-sm">
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
          <div className="rounded-xl bg-bg px-3 py-2 max-sm:col-span-2">
            <p className="muted flex items-center gap-1.5 text-xs font-medium"><Phone size={13} /> Telefon</p>
            {employee.phone
              ? <a href={`tel:${employee.phone}`} className="link whitespace-nowrap max-sm:text-[13px]">{employee.phone}</a>
              : <p className="font-semibold">—</p>}
          </div>
          <div className="rounded-xl bg-bg px-3 py-2 max-sm:col-span-2">
            <p className="muted flex items-center gap-1.5 text-xs font-medium"><Car size={13} /> Maşın</p>
            {employee.has_car
              ? <p className="font-semibold"><span className="plate">{employee.car_plate ?? "Nömrə yazılmayıb"}</span>{employee.car_model && <span className="muted ml-1.5 text-xs font-medium">{employee.car_model}</span>}
                <span className="muted block text-xs font-medium">{employee.fuel_type === "diesel" ? "Dizel" : employee.fuel_type === "petrol" ? "Benzin" : "Yanacaq seçilməyib"}{employee.fuel_per_100 && ` · ${employee.fuel_per_100} L / 100 km`}</span></p>
              : <p className="muted font-semibold">Yoxdur</p>}
          </div>
          {admin && (
            <div className="col-span-2">
              <AccountSection employeeId={employee.id} email={accounts.emails[employee.id] ?? null}
                hasAccount={!!employee.user_id} enabled={accounts.enabled} />
            </div>
          )}
        </div>
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

export type Partner = { key: string; names: string; today: number; month: number };

function EmployeeCard({ employee, todayCount, monthCount, status, partners, accounts, admin }: {
  partners: Partner[];
  accounts: Accounts;
  todayCount: number;
  monthCount: number;
  status?: TodayStatus;
  employee: Employee;
  admin: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [viewing, setViewing] = useState(false);

  return (
    <>
      {/* Modallar kartın çölündədir: içlərindəki kliklər karta keçib detalları yenidən açmasın */}
      {viewing && <EmployeeDetailsModal employee={employee} accounts={accounts} admin={admin} onClose={() => setViewing(false)} />}
      {editing && <EditEmployeeModal employee={employee} onClose={() => setEditing(false)} />}
      <PersonCard
        person={employee}
        badge={workerTypeLabel(employee.worker_type)}
        subtitle={employee.specialty ?? "İxtisas yazılmayıb"}
        status={status}
        stats={[
          { label: "Bu gün iş", value: todayCount, tone: todayCount ? "text-ok" : "" },
          { label: "Bu ay iş", value: monthCount, tone: monthCount ? "text-primary" : "" },
        ]}
        actions={admin && (
          <>
            <button type="button" onClick={() => setEditing(true)} className="icon-btn !h-8 !w-8" title="Redaktə et" aria-label="Redaktə et">
              <Pencil size={15} />
            </button>
            <ConfirmButton onConfirm={() => deleteEmployee(employee.id)} className="icon-btn !h-8 !w-8" title="Ustanı sil">
              <Trash2 size={15} />
            </ConfirmButton>
          </>
        )}
        footer={
          <>
            {/* Qrup işi: kimlə birlikdə işləyib */}
            {partners.map((p) => (
              <span key={p.key} className="mb-1.5 flex w-full items-center gap-1.5 rounded-lg bg-primary-soft/70 px-2 py-1 text-[11px] font-semibold text-primary"
                title={`${p.names} ilə birlikdə: bu ay ${p.month} iş`}>
                <Users size={12} className="shrink-0" />
                <span className="min-w-0 flex-1 truncate">{p.names} ilə birlikdə</span>
                <span className="shrink-0 tabular-nums">{p.today > 0 && <>bu gün {p.today} · </>}bu ay {p.month}</span>
              </span>
            ))}
          <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            {employee.has_car
              ? <span className="flex items-center gap-1.5" title={employee.car_model ?? "Maşın"}><Car size={13} className="text-primary" /><span className="plate">{employee.car_plate ?? "Nömrəsiz"}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${employee.fuel_type === "diesel" ? "bg-[#fff6e5] text-amber-700" : employee.fuel_type === "petrol" ? "bg-primary-soft text-primary" : "bg-danger-soft text-danger"}`}>
                  {employee.fuel_type === "diesel" ? "Dizel" : employee.fuel_type === "petrol" ? "Benzin" : "Yanacaq?"}
                </span></span>
              : <span className="muted flex items-center gap-1.5"><Car size={13} /> Maşını yoxdur</span>}
            {admin && accounts.enabled && (employee.user_id
              ? <span className="flex items-center gap-1.5 text-ok"><KeyRound size={13} /> Giriş hesabı var</span>
              : <span className="muted flex items-center gap-1.5"><KeyRound size={13} /> Hesab açılmayıb</span>)}
          </span>
          </>
        }
        onOpen={() => setViewing(true)}
      />
    </>
  );
}

// Ustalar: yapışan axtarış və profil kartları
export function EmployeeList({ employees, todayWork, monthWork, status, partners, accounts, admin }: {
  partners: Record<number, Partner[]>; // usta id → kimlərlə birlikdə iş görüb
  accounts: Accounts;
  todayWork: Record<number, number>; // usta id → bu gün yazılan iş sayı
  monthWork: Record<number, number>; // usta id → bu ay yazılan iş sayı
  status: Record<number, TodayStatus>; // usta id → bu günkü davamiyyət vəziyyəti
  employees: Employee[];
  admin: boolean;
}) {
  const [query, setQuery] = useState(urlQuery);

  const filtered = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    return employees.filter((e) => {
      const haystack = norm(`${e.full_name} ${e.specialty} ${e.phone} ${workerTypeLabel(e.worker_type)}`);
      return words.every((w) => haystack.includes(w));
    });
  }, [employees, query]);

  if (employees.length === 0) {
    return (
      <div className="card py-12 text-center">
        <span className="icon-tile mx-auto"><Users size={20} /></span>
        <p className="mt-3 font-semibold">Hələ usta yoxdur</p>
        {admin && <p className="muted text-sm">Yuxarıdakı «Yeni usta» düyməsi ilə ilk ustanı əlavə et.</p>}
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Axtarış yuxarıda yapışıq qalır */}
      <div className="sticky top-[var(--header-h)] z-20 -mx-1 bg-bg/90 px-1 py-2 backdrop-blur">
        <label className="flex h-11 items-center gap-2.5 rounded-xl bg-surface px-3.5 ring-1 ring-line focus-within:ring-2 focus-within:ring-primary">
          <Search size={18} className="shrink-0 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ad, ixtisas, növ və ya telefon ilə axtar..."
            aria-label="Usta axtarışı"
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="text-muted hover:text-ink" aria-label="Axtarışı təmizlə">
              <X size={16} />
            </button>
          )}
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="card muted py-10 text-center text-sm">Bu axtarışa uyğun usta tapılmadı.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
          {filtered.map((e) => (
            <EmployeeCard key={e.id} employee={e} todayCount={todayWork[e.id] ?? 0} monthCount={monthWork[e.id] ?? 0}
              status={status[e.id]} partners={partners[e.id] ?? []} accounts={accounts} admin={admin} />
          ))}
        </div>
      )}
    </div>
  );
}
