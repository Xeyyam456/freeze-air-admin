
import { useActionState, useRef, useState } from "react";
import { FileSpreadsheet, Pencil, Plus, Trash2, X } from "lucide-react";
import { addStore, deleteStore, updateStore } from "@/actions/stores";
import { ConfirmButton } from "@/components/ConfirmButton";
import { ActionForm, Buttons, Field, SaveConfirmForm, useOnSuccess } from "@/components/forms";
import { Modal } from "@/shared/components/Modal";
import { StoreCard } from "@/components/StoreCard";
import type { Tables } from "@/types/database";
import { KIND, type Kind } from "@/lib/kinds";
import { StoreImport } from "./StoreImport";

function StoreFields({ s, companyId, kind }: { s?: Tables<"stores">; companyId: number; kind: Kind }) {
  const coords = s?.lat != null && s?.lng != null ? `${s.lat}, ${s.lng}` : "";
  return (
    <>
      <input type="hidden" name="company_id" value={companyId} />
      <div className="grid grid-cols-[100px_1fr] gap-3">
        <Field label="Kod">
          <input name="code" defaultValue={s?.code} placeholder="015" required className="field" />
        </Field>
        <Field label="Ad">
          <input name="name" defaultValue={s?.name} placeholder={KIND[kind].unitPlaceholder} required className="field" />
        </Field>
      </div>
      <Field label="Ünvan">
        <input name="address" defaultValue={s?.address ?? ""} placeholder="Bakı, Təbriz küç. 10" className="field" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Koordinat">
          <input name="coords" defaultValue={coords} placeholder="40.40930, 49.86710" className="field"
            title="Google Maps-də yerin üzərinə sağ klik et, ilk sətirdəki rəqəmləri kopyala və bura yapışdır" />
        </Field>
        <Field label="Telefon">
          <input name="phone" defaultValue={s?.phone ?? ""} className="field" />
        </Field>
      </div>
    </>
  );
}

function AddStoreForm({ companyId, kind }: { companyId: number; kind: Kind }) {
  const [state, action, pending] = useActionState(addStore, null);
  const ref = useRef<HTMLFormElement>(null);
  useOnSuccess(state, () => ref.current?.reset(), `${KIND[kind].Unit} əlavə edildi`);

  return (
    <ActionForm ref={ref} action={action} className="space-y-3">
      <StoreFields companyId={companyId} kind={kind} />
      <Buttons pending={pending} label={`${KIND[kind].UnitAcc} əlavə et`} />
    </ActionForm>
  );
}

// "Yeni mağaza/filial" və "Excel" bir kartda, tablarla: sağ panel ekrana sığsın deyə.
export function StoreTools({ companyId, kind }: { companyId: number; kind: Kind }) {
  const [tab, setTab] = useState<"single" | "excel">("single");

  const tabClass = (t: typeof tab) =>
    `flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-colors ${
      tab === t ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
    }`;

  return (
    <div className="card !py-4">
      <div className="mb-4 flex gap-1 rounded-xl bg-bg p-1" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "single"} onClick={() => setTab("single")} className={tabClass("single")}>
          <Plus size={16} /> Yeni {KIND[kind].unit}
        </button>
        <button type="button" role="tab" aria-selected={tab === "excel"} onClick={() => setTab("excel")} className={tabClass("excel")}>
          <FileSpreadsheet size={16} /> Excel-dən yüklə
        </button>
      </div>
      {tab === "single"
        ? <AddStoreForm companyId={companyId} kind={kind} />
        : <StoreImport companyId={companyId} kind={kind} />}
    </div>
  );
}

// Şirkət/market səhifəsindəki kart: redaktə ayrıca modalda açılır.
export function StoreAdminCard({ store, kind }: { store: Tables<"stores">; kind: Kind }) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(updateStore.bind(null, store.id), null);
  useOnSuccess(state, () => setEditing(false));
  const titleId = `edit-store-${store.id}`;

  return (
    <>
      <StoreCard store={store} action={
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={() => setEditing(true)} className="icon-btn" title="Redaktə et" aria-label="Redaktə et">
            <Pencil size={16} />
          </button>
          <ConfirmButton onConfirm={() => deleteStore(store.id)} className="icon-btn icon-btn-danger" title={`${KIND[kind].UnitAcc} sil`}>
            <Trash2 size={16} />
          </ConfirmButton>
        </div>
      } />

      {editing && (
        <Modal onClose={() => setEditing(false)} labelledBy={titleId} className="!max-w-lg">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="store-code !h-11 !w-11 !rounded-xl !text-sm">{store.code}</span>
              <div>
                <h2 id={titleId} className="text-lg font-bold">{KIND[kind].UnitAcc} redaktə et</h2>
                <p className="muted text-sm">{store.name}</p>
              </div>
            </div>
            <button type="button" onClick={() => setEditing(false)} className="icon-btn" aria-label="Bağla">
              <X size={18} />
            </button>
          </div>
          <SaveConfirmForm action={action} className="space-y-4">
            <StoreFields s={store} companyId={store.company_id} kind={kind} />
            <Buttons pending={pending} label="Yadda saxla" onCancel={() => setEditing(false)} />
          </SaveConfirmForm>
        </Modal>
      )}
    </>
  );
}
