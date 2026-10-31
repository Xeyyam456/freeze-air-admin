import { X } from "lucide-react";
import { DatePicker } from "@/shared/components/DatePicker";
import { Buttons, Field } from "@/components/forms";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { Modal } from "@/shared/components/Modal";
import type { WorkLogFormProps } from "@/types/workLogs";
import { PlacePicker } from "../PlacePicker";
import { ExistingFilesEditor } from "./ExistingFilesEditor";
import { NewFiles } from "./NewFiles";
import { useWorkLogForm } from "./useWorkLogForm";

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Yeni iş və ya redaktə (ustanın kartında): tarix, yer, görülən iş, akt və şəkillər
export function WorkLogForm(props: WorkLogFormProps) {
  const { employeeName, existing, onClose } = props;
  const f = useWorkLogForm(props);
  return (
    <Modal onClose={onClose} labelledBy="work-form-title" className="!max-w-lg">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 id="work-form-title" className="text-lg font-bold">{existing ? "İşi redaktə et" : "Yeni iş"}</h2>
          <p className="muted text-sm">{employeeName}</p>
        </div>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>

      <form onSubmit={f.onSubmit} className="space-y-4">
        <Field label="Tarix">
          <DatePicker name="work_date" defaultValue={existing?.work_date ?? today()} max={today()} required />
        </Field>

        <div>
          <span className="label">Yer</span>
          <PlacePicker places={f.places} value={f.place} onChange={f.setPlace} />
        </div>

        <Field label="Görülən iş">
          <textarea name="description" rows={3} required className="field resize-none" defaultValue={existing?.description}
            placeholder="Məs. 2 ədəd split kondisionerin profilaktikası, freon dolduruldu" />
        </Field>

        {existing && existing.files.length > 0 && <ExistingFilesEditor files={existing.files} removed={f.removed} onToggle={f.toggleRemove} />}
        <NewFiles act={f.act} hasAct={f.hasAct} photos={f.photos} onAct={f.setAct} onPhotos={f.setPhotos} />

        <Buttons pending={f.pending} label={existing ? "Yadda saxla" : "İşi yadda saxla"} onCancel={onClose} />
        <ConfirmModal
          open={!!f.confirmData}
          title="Məlumatların doğruluğunu təsdiq edirsinizmi?"
          message="İşdəki dəyişikliklər yadda saxlanılacaq."
          confirmLabel="Bəli, yadda saxla"
          onCancel={() => f.setConfirmData(null)}
          onConfirm={() => {
            const form = f.confirmData;
            f.setConfirmData(null);
            if (form) f.save(form);
          }}
        />
      </form>
    </Modal>
  );
}
