import { X } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import type { EquipmentEditorProps } from "@/types/site";
import { ILLUSTRATED_KEYS } from "../../constants/siteConstants";
import { useEquipmentEditor } from "../../hooks/useEquipmentEditor";
import { EditorFooter } from "../common/EditorFooter";
import { SiteImagePicker } from "../common/SiteImagePicker";
import { EquipmentFields } from "./EquipmentFields";

// Avadanlıq növünü (Divar tipli split və s.) yaratmaq / dəyişmək
export function EquipmentEditor({ item, nextSort, onClose }: EquipmentEditorProps) {
  const f = useEquipmentEditor(item, onClose);
  const illustrated = ILLUSTRATED_KEYS.includes(f.ts.slug);

  return (
    <Modal onClose={f.cancel} labelledBy="equipment-editor-title" className="!max-w-3xl !p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="equipment-editor-title" className="text-lg font-bold">{item ? "Avadanlığı redaktə et" : "Yeni avadanlıq"}</h2>
        <button type="button" onClick={f.cancel} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>

      <form onSubmit={f.submit} className="grid gap-5 md:grid-cols-[280px_1fr]">
        <SiteImagePicker picker={f.picker} label="Şəkil" previewClass="aspect-video" imgClass="h-full w-full object-contain"
          empty={illustrated ? "Şəkil yoxdur: saytda hazır illüstrasiya göstərilir" : "Şəkil yoxdur: saytda ikon göstərilir"}
          hint="Tövsiyə: 16:9, məsələn 1600×900 px; avadanlıq ortada." hintClass="mt-2 text-[11px] leading-snug" />
        <EquipmentFields item={item} nextSort={nextSort} ts={f.ts} />
        <EditorFooter onCancel={f.cancel} busy={f.pending || f.picker.uploading} className="md:col-span-2" />
      </form>
    </Modal>
  );
}
