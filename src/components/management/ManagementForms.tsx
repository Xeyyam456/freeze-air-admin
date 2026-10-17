import { useActionState, useRef, useState } from "react";
import { Briefcase, CalendarDays, Pencil, Phone, Plus, Search, ShieldCheck, Trash2, UserCog, X } from "lucide-react";
import { addEmployee, deleteEmployee, updateEmployee } from "@/actions/employees";
import { ConfirmButton } from "@/components/ConfirmButton";
import { DatePicker } from "@/components/DatePicker";
import { AvatarUpload } from "@/components/employees/AvatarUpload";
import { AccountSection, Avatar, formatDate, type Accounts } from "@/components/employees/EmployeeForms";
import { ActionForm, Buttons, Field, SaveConfirmForm, useOnSuccess } from "@/components/forms";
import { Modal } from "@/components/Modal";
import type { Tables } from "@/lib/database.types";
import { experience } from "@/lib/experience";

type Manager = Tables<"employees">;

const ACCOUNT_NOTE = "Rəhbərlik hesabı admin yetkisi alır: idarəetmə panelinə daxil olub hər şeyi dəyişə bilər.";

function norm(s: string | null | undefined) {
  return (s ?? "")
    .toLowerCase()
    .replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g");
}

function ManagerFields({ m }: { m?: Manager }) {
  return (
    <>
      <input type="hidden" name="is_management" value="1" />
      <Field label="Soyad və ad">
        <input name="full_name" defaultValue={m?.full_name} placeholder="Məmmədov Əli" required className="field" />
      </Field>
      <Field label="Vəzifə">
        <input name="position" defaultValue={m?.position ?? ""} placeholder="Servis müdiri" required className="field" list="positions" />
      </Field>
      <datalist id="positions">
        <option value="Müdir" />
        <option value="Servis müdiri" />
        <option value="Maliyyəçi" />
        <option value="Mühasib" />
      </datalist>
      <div className="grid grid-cols-2 gap-3">
        <Field label="İşə başlama tarixi">
          <DatePicker name="start_date" defaultValue={m?.start_date} placeholder="Seçilməyib" />
        </Field>
        <Field label="Telefon">
          <input name="phone" defaultValue={m?.phone ?? ""} placeholder="+994 50 000 00 00" className="field" />
        </Field>
      </div>
    </>
  );
}

// Sağ paneldəki "Yeni rəhbər" kartı
export function AddManagerCard() {
  const [state, action, pending] = useActionState(addEmployee, null);
  const ref = useRef<HTMLFormElement>(null);
  // Təqvim öz vəziyyətini saxlayır, form.reset() onu təmizləmir: uğurdan sonra sahələri yenidən yaradırıq
  const [formKey, setFormKey] = useState(0);
  useOnSuccess(state, () => {
    ref.current?.reset();
    setFormKey((k) => k + 1);
  }, "Rəhbər əlavə edildi");

  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-3">
        <span className="icon-tile !h-9 !w-9"><Plus size={18} /></span>
        <h2 className="card-title">Yeni rəhbər</h2>
      </div>
      <ActionForm ref={ref} action={action} className="space-y-4">
        <ManagerFields key={formKey} />
        <Buttons pending={pending} label="Rəhbəri əlavə et" />
      </ActionForm>
    </div>
  );
}

function EditManagerModal({ manager, onClose }: { manager: Manager; onClose: () => void }) {
  const [state, action, pending] = useActionState(updateEmployee.bind(null, manager.id), null);
  useOnSuccess(state, onClose);

  return (
    <Modal onClose={onClose} labelledBy="edit-manager-title" className="!max-w-lg">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar employee={manager} className="!h-11 !w-11 !text-sm" />
          <div>
            <h2 id="edit-manager-title" className="text-lg font-bold">Rəhbəri redaktə et</h2>
            <p className="muted text-sm">{manager.full_name}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>
      <div className="mb-4"><AvatarUpload employee={manager} /></div>
      <SaveConfirmForm action={action} className="space-y-4">
        <ManagerFields m={manager} />
        <Buttons pending={pending} label="Yadda saxla" onCancel={onClose} />
      </SaveConfirmForm>
    </Modal>
  );
}

function ManagerDetailsModal({ manager, accounts, canEdit, onClose }: {
  manager: Manager;
  accounts: Accounts;
  canEdit: boolean;
  onClose: () => void;
}) {
  const exp = experience(manager.start_date);

  return (
    <Modal onClose={onClose} labelledBy={`mgr-${manager.id}-title`} className="!max-w-xl overflow-hidden !p-0">
      <div className="relative h-24 bg-[linear-gradient(120deg,#0a1a33,#0f2a55_55%,#0e3b6e)]">
        <button type="button" onClick={onClose} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white" aria-label="Bağla">
          <X size={18} />
        </button>
      </div>
      <div className="relative -mt-12 px-6 pb-6 text-center">
        <Avatar employee={manager} className="mx-auto !h-24 !w-24 !text-2xl ring-4 ring-white" />
        <h2 id={`mgr-${manager.id}-title`} className="mt-3 text-xl font-bold">{manager.full_name}</h2>
        <p className="muted text-sm">{manager.position}</p>

        <div className="mt-5 grid grid-cols-2 gap-2 text-left text-sm">
          <div className="rounded-xl bg-bg px-3 py-2">
            <p className="muted flex items-center gap-1.5 text-xs font-medium"><Briefcase size={13} /> Təcrübə</p>
            <p className="font-semibold">{exp ?? "—"}</p>
          </div>
          <div className="rounded-xl bg-bg px-3 py-2">
            <p className="muted flex items-center gap-1.5 text-xs font-medium"><CalendarDays size={13} /> İşə başlayıb</p>
            <p className="font-semibold">{formatDate(manager.start_date) ?? "—"}</p>
          </div>
          <div className="col-span-2 rounded-xl bg-bg px-3 py-2">
            <p className="muted flex items-center gap-1.5 text-xs font-medium"><Phone size={13} /> Telefon</p>
            {manager.phone
              ? <a href={`tel:${manager.phone}`} className="link">{manager.phone}</a>
              : <p className="font-semibold">—</p>}
          </div>
          {canEdit && <div className="col-span-2">
            <AccountSection employeeId={manager.id} email={accounts.emails[manager.id] ?? null}
              hasAccount={!!manager.user_id} enabled={accounts.enabled} note={ACCOUNT_NOTE} />
          </div>}
        </div>
      </div>
    </Modal>
  );
}

function ManagerCard({ manager, accounts, canEdit, isMe }: { manager: Manager; accounts: Accounts; canEdit: boolean; isMe: boolean }) {
  const [editing, setEditing] = useState(false);
  const [viewing, setViewing] = useState(false);
  const exp = experience(manager.start_date);

  return (
    <>
      {viewing && <ManagerDetailsModal manager={manager} accounts={accounts} canEdit={canEdit} onClose={() => setViewing(false)} />}
      {editing && <EditManagerModal manager={manager} onClose={() => setEditing(false)} />}

      <div
        className={`store-card cursor-pointer ${isMe ? "!border-primary" : ""}`}
        role="button"
        tabIndex={0}
        aria-label={`${manager.full_name}: məlumatlara bax`}
        onClick={() => setViewing(true)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && e.target === e.currentTarget && setViewing(true)}
      >
        <div className="flex gap-4">
          <Avatar employee={manager} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-[15px] font-bold">{manager.full_name}</h3>
                <p className="muted text-[13px]">{manager.position}</p>
              </div>
              {isMe && <span className="shrink-0 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary">Sən</span>}
              {canEdit && <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                <button type="button" onClick={() => setEditing(true)} className="icon-btn" title="Redaktə et" aria-label="Redaktə et">
                  <Pencil size={16} />
                </button>
                <ConfirmButton onConfirm={() => deleteEmployee(manager.id)} className="icon-btn icon-btn-danger" title="Rəhbəri sil">
                  <Trash2 size={16} />
                </ConfirmButton>
              </div>}
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-[13px]">
              <Phone size={14} className="muted shrink-0" />
              {manager.phone
                ? <a href={`tel:${manager.phone}`} className="link" onClick={(e) => e.stopPropagation()}>{manager.phone}</a>
                : <span className="muted">Telefon yoxdur</span>}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-dashed border-line pt-3 text-xs font-semibold">
          <span className="flex items-center gap-2">
            <Briefcase size={14} className="text-primary" />
            {exp ? <span>Təcrübə: {exp}</span> : <span className="muted">İşə başlama tarixi yazılmayıb</span>}
          </span>
          {manager.user_id
            ? <span className="flex items-center gap-1.5 text-ok"><ShieldCheck size={13} /> Admin hesabı var</span>
            : <span className="muted flex items-center gap-1.5"><ShieldCheck size={13} /> Hesab açılmayıb</span>}
        </div>
      </div>
    </>
  );
}

// canEdit: sahibdir; myUserId: öz kartı yalnız baxış üçündür (özünü silib idarəsiz qalmasın)
export function ManagerList({ managers, accounts, canEdit, myUserId }: {
  managers: Manager[];
  accounts: Accounts;
  canEdit: boolean;
  myUserId: string | null;
}) {
  const [query, setQuery] = useState("");
  const words = norm(query).split(/\s+/).filter(Boolean);
  const filtered = managers.filter((m) => {
    const haystack = norm(`${m.full_name} ${m.position} ${m.phone}`);
    return words.every((w) => haystack.includes(w));
  });

  if (managers.length === 0) {
    return (
      <div className="card py-12 text-center">
        <span className="icon-tile mx-auto"><UserCog size={20} /></span>
        <p className="mt-3 font-semibold">Hələ rəhbər yoxdur</p>
        {canEdit && <p className="muted text-sm">Sağdakı formdan müdir, servis müdiri və ya maliyyəçini əlavə et.</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Axtarış öz yerində qalır; üstündəki boşluq (before) və altındakı zolaq bərk fonludur: sürüşən məzmun orada görünmür */}
      <div className="sticky top-0 z-10 rounded-[14px] shadow-[0_16px_0_0_#f8f9fc] before:absolute before:inset-x-0 before:bottom-full before:h-8 before:bg-[#f8f9fc]">
        <div className="search">
        <Search size={20} />
        <input value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Ad, vəzifə və ya telefon ilə axtar..." aria-label="Rəhbər axtarışı" />
      </div>
      </div>
      {filtered.length === 0 ? (
        <div className="card muted py-10 text-center text-sm">Bu axtarışa uyğun rəhbər tapılmadı.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((m) => <ManagerCard key={m.id} manager={m} accounts={accounts} isMe={m.user_id === myUserId}
              canEdit={canEdit && m.user_id !== myUserId} />)}
        </div>
      )}
    </div>
  );
}
