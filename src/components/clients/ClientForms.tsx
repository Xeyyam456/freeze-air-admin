
import { useActionState, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { MapPin, Pencil, Phone, Plus, Trash2, User, X } from "lucide-react";
import { addCompany, deleteCompany, updateCompany } from "@/actions/companies";
import { ConfirmButton } from "@/components/ConfirmButton";
import { ActionForm, Buttons, Field, SaveConfirmForm, useOnSuccess } from "@/components/forms";
import { Modal } from "@/components/Modal";
import { StoreTools } from "@/components/stores/StoreForms";
import type { Tables } from "@/lib/database.types";
import { KIND, type Kind } from "@/lib/kinds";

function ClientFields({ c, kind }: { c?: Tables<"companies">; kind: Kind }) {
  return (
    <>
      <input type="hidden" name="kind" value={kind} />
      <Field label="Ad">
        <input name="name" defaultValue={c?.name} placeholder={KIND[kind].namePlaceholder} required className="field" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Telefon">
          <input name="phone" defaultValue={c?.phone ?? ""} placeholder="012 000 00 00" className="field" />
        </Field>
        <Field label="Əlaqəli şəxs">
          <input name="contact_person" defaultValue={c?.contact_person ?? ""} className="field" />
        </Field>
      </div>
      {/* Şirkətin öz ünvanı: sabit məkanlı şirkətlər üçün (stadion, Port Baku). Marketlərin ünvanı mağazalardadır. */}
      {kind === "company" && (
        <>
          <Field label="Ünvan">
            <input name="address" defaultValue={c?.address ?? ""} placeholder="Bakı, Neftçilər pr. 153" className="field" />
          </Field>
          <Field label="Koordinat">
            <input name="coords" placeholder="40.40930, 49.86710" className="field"
              defaultValue={c?.lat != null && c?.lng != null ? `${c.lat}, ${c.lng}` : ""}
              title="Google Maps-də yerin üzərinə sağ klik et, ilk sətirdəki rəqəmləri kopyala və bura yapışdır" />
          </Field>
        </>
      )}
      <Field label="Qeyd">
        <textarea name="notes" defaultValue={c?.notes ?? ""} rows={2} className="field resize-none" />
      </Field>
    </>
  );
}

function AddClientFields({ kind, onDone }: { kind: Kind; onDone: () => void }) {
  const [state, action, pending] = useActionState(addCompany, null);
  const ref = useRef<HTMLFormElement>(null);
  useOnSuccess(state, onDone, `${KIND[kind].One} əlavə edildi`);

  return (
    <ActionForm ref={ref} action={action} className="space-y-4">
      <ClientFields kind={kind} />
      <Buttons pending={pending} label={`${KIND[kind].One}i əlavə et`} />
    </ActionForm>
  );
}

// "Yeni şirkət" / "Yeni market": başlıqdakı düymə pəncərə açır, siyahı bütün eni tutur
export function AddClientButton({ kind }: { kind: Kind }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="hero-action">
        <Plus size={17} /> Yeni {KIND[kind].one}
      </button>
      {open && (
        <Modal onClose={() => setOpen(false)} labelledBy="add-client-title" className="!max-w-lg">
          <div className="mb-5 flex items-center gap-3">
            <span className="icon-tile !h-10 !w-10"><Plus size={18} /></span>
            <h2 id="add-client-title" className="card-title">Yeni {KIND[kind].one}</h2>
          </div>
          <AddClientFields kind={kind} onDone={() => setOpen(false)} />
        </Modal>
      )}
    </>
  );
}

// Sağ panel: şirkət/market məlumatı + filial/mağaza alətləri
export function ClientAside({ company, unitCount, admin }: {
  company: Tables<"companies">;
  unitCount: number;
  admin: boolean;
}) {
  const kind: Kind = company.kind === "market" ? "market" : "company";
  // Sabit məkanlı şirkətdə (filialı yoxdur) filial bölməsi göstərilmir.
  const fixedPlace = kind === "company" && unitCount === 0;

  return (
    <>
      <ClientInfoCard company={company} kind={kind} unitCount={unitCount} admin={admin} />
      {admin && !fixedPlace && <StoreTools companyId={company.id} kind={kind} />}
    </>
  );
}

// Şirkət/market redaktəsi ayrıca modalda açılır.
function ClientEditModal({ company, kind, onClose }: { company: Tables<"companies">; kind: Kind; onClose: () => void }) {
  const [state, action, pending] = useActionState(updateCompany.bind(null, company.id), null);
  useOnSuccess(state, onClose);
  const k = KIND[kind];

  return (
    <Modal onClose={onClose} labelledBy="edit-client-title" className="!max-w-lg">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-frost to-primary text-lg font-extrabold text-white">
            {company.name.charAt(0)}
          </span>
          <div>
            <h2 id="edit-client-title" className="text-lg font-bold">{k.One}i redaktə et</h2>
            <p className="muted text-sm">{company.name}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla">
          <X size={18} />
        </button>
      </div>
      <SaveConfirmForm action={action} className="space-y-4">
        <ClientFields c={company} kind={kind} />
        <Buttons pending={pending} label="Yadda saxla" onCancel={onClose} />
      </SaveConfirmForm>
    </Modal>
  );
}

function ClientInfoCard({ company, kind, unitCount, admin }: {
  company: Tables<"companies">;
  kind: Kind;
  unitCount: number;
  admin: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();
  const k = KIND[kind];

  return (
    <div className="card">
      {editing && <ClientEditModal company={company} kind={kind} onClose={() => setEditing(false)} />}
      {/* Vizit kartı: baş hərf, ad, növ və filial sayı */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-frost to-primary text-xl font-extrabold text-white shadow-[0_6px_16px_rgba(10,126,164,0.3)]">
            {company.name.charAt(0)}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold">{company.name}</h2>
            <p className="muted text-xs font-medium">
              {k.One} · {kind === "company" && unitCount === 0 ? "sabit məkan" : `${unitCount} ${k.unit}`}
            </p>
          </div>
        </div>
        {admin && (
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setEditing(true)} className="icon-btn" title="Redaktə et" aria-label="Redaktə et">
              <Pencil size={16} />
            </button>
            <ConfirmButton
              className="icon-btn icon-btn-danger"
              title={`${k.One}i sil`}
              question={unitCount > 0
                ? `${k.One}lə birlikdə onun ${unitCount} ${k.unit}${kind === "market" ? "sı" : "ı"} da silinəcək. Bu əməliyyatı geri qaytarmaq olmur.`
                : "Bu əməliyyatı geri qaytarmaq olmur."}
              onConfirm={async () => navigate(await deleteCompany(company.id))}
            >
              <Trash2 size={16} />
            </ConfirmButton>
          </div>
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="min-w-0 rounded-xl bg-bg px-3 py-2">
          <p className="muted flex items-center gap-1.5 text-xs font-medium"><User size={13} /> Əlaqəli şəxs</p>
          <p className="truncate font-semibold">{company.contact_person ?? "—"}</p>
        </div>
        <div className="min-w-0 rounded-xl bg-bg px-3 py-2">
          <p className="muted flex items-center gap-1.5 text-xs font-medium"><Phone size={13} /> Telefon</p>
          {company.phone
            ? <a href={`tel:${company.phone}`} className="link block truncate">{company.phone}</a>
            : <p className="font-semibold">—</p>}
        </div>
      </div>
      {kind === "company" && (
        <div className="mt-2 min-w-0 rounded-xl bg-bg px-3 py-2 text-sm">
          <p className="muted flex items-center gap-1.5 text-xs font-medium"><MapPin size={13} /> Ünvan</p>
          <p className="truncate font-semibold">{company.address ?? "—"}</p>
        </div>
      )}
      {company.notes && <p className="muted mt-3 line-clamp-2 text-sm">{company.notes}</p>}
    </div>
  );
}
