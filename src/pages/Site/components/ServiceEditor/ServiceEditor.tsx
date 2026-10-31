import { X } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import type { ServiceEditorProps } from "@/types/site";
import { useServiceEditor } from "../../hooks/useServiceEditor";
import { EditorFooter } from "../common/EditorFooter";
import { ServiceListColumn } from "./ServiceListColumn";
import { ServiceMediaColumn } from "./ServiceMediaColumn";
import { ServiceTextColumn } from "./ServiceTextColumn";

// Xidməti yaratmaq / dəyişmək: siyahıdakı sətir + saytda /xidmet/<ünvan> səhifəsi
export function ServiceEditor({ service, nextSort, onClose }: ServiceEditorProps) {
  const f = useServiceEditor(service, onClose);

  return (
    <Modal onClose={f.cancel} labelledBy="service-editor-title" className="!max-w-[1180px] !p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 id="service-editor-title" className="text-lg font-bold">{service ? "Xidməti redaktə et" : "Yeni xidmət"}</h2>
          <p className="muted text-xs">Xidmətlər siyahısı, footer və saytda /xidmet/{f.ts.slug || "..."} səhifəsi</p>
        </div>
        <button type="button" onClick={f.cancel} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>

      {/* Üç sütun: sürüşmə olmadan bir ekrana sığır */}
      <form onSubmit={f.submit} className="grid gap-5 lg:grid-cols-[260px_1fr_1fr]">
        <ServiceMediaColumn service={service} nextSort={nextSort} picker={f.picker} icon={f.icon} onIcon={f.setIcon} />
        <ServiceTextColumn service={service} ts={f.ts} />
        <ServiceListColumn service={service} />
        <EditorFooter onCancel={f.cancel} busy={f.pending || f.picker.uploading} className="lg:col-span-3" />
      </form>
    </Modal>
  );
}
