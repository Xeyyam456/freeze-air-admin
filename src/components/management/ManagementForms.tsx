import { urlQuery } from "@/lib/urlQuery";
import { useActionState, useState } from "react";
import { Briefcase, CalendarDays, Crown, Pencil, Phone, Plus, Search, ShieldCheck, Trash2, UserCog, X } from "lucide-react";
import { addEmployee, deleteEmployee, updateEmployee } from "@/actions/employees";
import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { ConfirmButton } from "@/components/ConfirmButton";
import { DatePicker } from "@/components/DatePicker";
import { AvatarUpload } from "@/components/employees/AvatarUpload";
import { AccountSection, Avatar, formatDate, type Accounts } from "@/components/employees/EmployeeForms";
import { PersonCard } from "@/components/employees/PersonCard";
import { ActionForm, Buttons, Field, SaveConfirmForm, useOnSuccess } from "@/components/forms";
import { Modal } from "@/components/Modal";
import type { Tables } from "@/lib/database.types";
import { experience } from "@/lib/experience";

type Manager = Tables<"employees">;

const ACCOUNT_NOTE = "Rəhbərlik hesabı admin yetkisi alır: tapşırıq, icazə, davamiyyət, müştərilər, ustalar; saytın məzmununu yalnız müdir dəyişir.";

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

// "Yeni rəhbər" (yalnız müdir): başlıqdakı düymə pəncərə açır, siyahı bütün eni tutur
function AddManagerForm({ onDone }: { onDone: () => void }) {
  const [state, action, pending] = useActionState(addEmployee, null);
  useOnSuccess(state, onDone, "Rəhbər əlavə edildi");
  return (
    <ActionForm action={action} className="space-y-4">
      <ManagerFields />
      <Buttons pending={pending} label="Rəhbəri əlavə et" />
    </ActionForm>
  );
}

export function AddManagerButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="hero-action">
        <Plus size={17} /> Yeni rəhbər
      </button>
      {open && (
        <Modal onClose={() => setOpen(false)} labelledBy="add-manager-title" className="!max-w-lg">
          <div className="mb-5 flex items-center gap-3">
            <span className="icon-tile !h-10 !w-10"><Plus size={18} /></span>
            <h2 id="add-manager-title" className="card-title">Yeni rəhbər</h2>
          </div>
          <AddManagerForm onDone={() => setOpen(false)} />
        </Modal>
      )}
    </>
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

// Müdir olmayan rəhbər (və müdir öz kartında): yalnız telefon və şəkil (bazada employees_guard_management, 0069)
function ContactModal({ manager, onClose }: { manager: Manager; onClose: () => void }) {
  const [phone, setPhone] = useState(manager.phone ?? "");
  const [pending, setPending] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const { error } = await createClient().from("employees").update({ phone: phone.trim() || null }).eq("id", manager.id);
    setPending(false);
    if (error) return toast.error(error.message);
    toast.success("Telefon yadda saxlanıldı");
    revalidate();
    onClose();
  }

  return (
    <Modal onClose={onClose} labelledBy="contact-manager-title" className="!max-w-md">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 id="contact-manager-title" className="text-lg font-bold">Telefon və şəkil</h2>
          <p className="muted text-sm">{manager.full_name}</p>
        </div>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>
      <div className="mb-4"><AvatarUpload employee={manager} /></div>
      <form onSubmit={save} className="space-y-4">
        <Field label="Telefon">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+994 50 000 00 00" className="field" />
        </Field>
        <p className="muted text-xs">Ad, vəzifə və hesabı yalnız müdir dəyişir.</p>
        <Buttons pending={pending} label="Yadda saxla" onCancel={onClose} />
      </form>
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
      <div className="relative h-24 bg-[linear-gradient(120deg,#0b1324,#11243a_55%,#0f3d4c)]">
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

type CardProps = { manager: Manager; accounts: Accounts; canEdit: boolean; canContact: boolean; isMe: boolean };

// Kartın düymələri: müdir redaktə edir və silir; digər admin yalnız telefon və şəkli dəyişir (0069)
function CardActions({ manager, canEdit, canContact, onEdit, onContact, light = false }: CardProps & { onEdit: () => void; onContact: () => void; light?: boolean }) {
  const btn = `icon-btn !h-8 !w-8${light ? " !text-white/75 hover:!bg-white/15 hover:!text-white" : ""}`;
  if (canEdit) {
    return (
      <>
        <button type="button" onClick={onEdit} className={btn} title="Redaktə et" aria-label="Redaktə et"><Pencil size={15} /></button>
        <ConfirmButton onConfirm={() => deleteEmployee(manager.id)} className={btn} title="Rəhbəri sil"><Trash2 size={15} /></ConfirmButton>
      </>
    );
  }
  if (canContact) {
    return <button type="button" onClick={onContact} className={btn} title="Telefon və şəkli dəyiş" aria-label="Telefon və şəkli dəyiş"><Pencil size={15} /></button>;
  }
  return null;
}

function AccountLine({ manager }: { manager: Manager }) {
  return manager.user_id
    ? <span className="flex items-center gap-1.5 text-ok"><ShieldCheck size={13} /> Admin hesabı var</span>
    : <span className="muted flex items-center gap-1.5"><ShieldCheck size={13} /> Hesab açılmayıb</span>;
}

// Kart + onun pəncərələri (məlumat, redaktə, telefon/şəkil)
function useManagerModals(props: CardProps) {
  const [editing, setEditing] = useState(false);
  const [contact, setContact] = useState(false);
  const [viewing, setViewing] = useState(false);
  const modals = (
    <>
      {viewing && <ManagerDetailsModal manager={props.manager} accounts={props.accounts} canEdit={props.canEdit} onClose={() => setViewing(false)} />}
      {editing && <EditManagerModal manager={props.manager} onClose={() => setEditing(false)} />}
      {contact && <ContactModal manager={props.manager} onClose={() => setContact(false)} />}
    </>
  );
  return { modals, open: () => setViewing(true), edit: () => setEditing(true), contact: () => setContact(true) };
}

function ManagerCard(props: CardProps) {
  const { manager, isMe } = props;
  const m = useManagerModals(props);
  return (
    <>
      {m.modals}
      <PersonCard
        person={manager}
        subtitle={manager.position ?? "Rəhbərlik"}
        badge={isMe ? "Sən" : undefined}
        highlight={isMe}
        actions={<CardActions {...props} onEdit={m.edit} onContact={m.contact} />}
        footer={<AccountLine manager={manager} />}
        onOpen={m.open}
      />
    </>
  );
}

// Müdirin iri tünd kartı (rəhbərliyin başı)
function LeadCard(props: CardProps) {
  const { manager, isMe } = props;
  const m = useManagerModals(props);
  const exp = experience(manager.start_date);
  const actions = <CardActions {...props} onEdit={m.edit} onContact={m.contact} light />;

  return (
    <>
      {m.modals}
      <div
        className="relative flex cursor-pointer flex-wrap items-center gap-x-6 gap-y-4 rounded-[18px] bg-[linear-gradient(120deg,#0b1324,#11243a_55%,#0f3d4c)] px-6 py-6 text-white transition-transform hover:-translate-y-0.5"
        role="button"
        tabIndex={0}
        aria-label={`${manager.full_name}: məlumatlara bax`}
        onClick={m.open}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && e.target === e.currentTarget && m.open()}
      >
        <Avatar employee={manager} className="!h-24 !w-24 !text-2xl ring-4 ring-white/15" />
        <div className="min-w-0 flex-[1_1_260px]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-frost">
            <Crown size={12} /> {manager.position ?? "Rəhbər"}{isMe && " · Sən"}
          </span>
          <h2 className="mt-1.5 truncate text-2xl font-extrabold">{manager.full_name}</h2>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/65">
            <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-white/45" />{exp ? `Təcrübə: ${exp}` : "Təcrübə yazılmayıb"}</span>
            <span className={`flex items-center gap-1.5 ${manager.user_id ? "text-[#4ade80]" : ""}`}>
              <ShieldCheck size={14} />{manager.user_id ? "Admin hesabı var" : "Hesab açılmayıb"}
            </span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          {manager.phone ? (
            <a href={`tel:${manager.phone}`} className="btn !bg-white !text-[#0b1324] hover:!bg-frost"><Phone size={16} /> {manager.phone}</a>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-white/50"><Phone size={15} /> Telefon yazılmayıb</span>
          )}
          {actions}
        </div>
      </div>
    </>
  );
}

// Vəzifə sırası: müdir ən üstdə, sonra servis müdirləri, sonra qalanlar (maliyyəçi və s.)
function rank(position: string | null) {
  const p = (position ?? "").toLocaleLowerCase("az");
  if (p === "müdir") return 0;
  if (p.includes("müdir")) return 1;
  return 2;
}

// canEdit: sahibdir; myUserId: öz kartı tam redaktə olunmur (özünü silib idarəsiz qalmasın);
// canContact: istənilən rəhbər (admin) telefon və şəkli dəyişir (0069)
export function ManagerList({ managers, accounts, canEdit, canContact = false, myUserId }: {
  managers: Manager[];
  accounts: Accounts;
  canEdit: boolean;
  canContact?: boolean;
  myUserId: string | null;
}) {
  const [query, setQuery] = useState(urlQuery);
  const words = norm(query).split(/\s+/).filter(Boolean);
  const filtered = managers
    .filter((m) => {
      const haystack = norm(`${m.full_name} ${m.position} ${m.phone}`);
      return words.every((w) => haystack.includes(w));
    })
    .sort((a, b) => rank(a.position) - rank(b.position) || a.full_name.localeCompare(b.full_name, "az"));

  if (managers.length === 0) {
    return (
      <div className="card py-12 text-center">
        <span className="icon-tile mx-auto"><UserCog size={20} /></span>
        <p className="mt-3 font-semibold">Hələ rəhbər yoxdur</p>
        {canEdit && <p className="muted text-sm">Yuxarıdakı «Yeni rəhbər» düyməsi ilə müdir, servis müdiri və ya maliyyəçini əlavə et.</p>}
      </div>
    );
  }

  const props = (m: Manager): CardProps => ({
    manager: m, accounts, isMe: m.user_id === myUserId, canEdit: canEdit && m.user_id !== myUserId, canContact,
  });
  const lead = filtered[0] && rank(filtered[0].position) === 0 ? filtered[0] : null;
  const rest = lead ? filtered.slice(1) : filtered;

  return (
    <div className="space-y-5">
      {/* Axtarış yuxarıda yapışıq qalır */}
      <div className="sticky top-[var(--header-h)] z-20 -mx-1 bg-bg/90 px-1 py-2 backdrop-blur">
        <label className="flex h-11 items-center gap-2.5 rounded-xl bg-surface px-3.5 ring-1 ring-line focus-within:ring-2 focus-within:ring-primary">
          <Search size={18} className="shrink-0 text-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Ad, vəzifə və ya telefon ilə axtar..." aria-label="Rəhbər axtarışı"
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none" />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="text-muted hover:text-ink" aria-label="Axtarışı təmizlə">
              <X size={16} />
            </button>
          )}
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="card muted py-10 text-center text-sm">Bu axtarışa uyğun rəhbər tapılmadı.</div>
      ) : (
        <>
          {lead && <LeadCard {...props(lead)} />}
          {rest.length > 0 && (
            <section>
              <h2 className="muted mb-3 text-xs font-semibold uppercase tracking-wider">{lead ? "Komanda rəhbərləri" : "Rəhbərlik"} · {rest.length}</h2>
              <div className="flex flex-wrap gap-4">
                {rest.map((m) => (
                  <div key={m.id} className="flex min-w-0 grow basis-[320px] [&>*]:flex-1"><ManagerCard {...props(m)} /></div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
