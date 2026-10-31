import { X } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import type { SegmentEditorProps } from "@/types/site";
import { useSegmentEditor } from "../../hooks/useSegmentEditor";
import { EditorFooter } from "../common/EditorFooter";
import { SegmentListColumn } from "./SegmentListColumn";
import { SegmentMediaColumn } from "./SegmentMediaColumn";
import { SegmentTextColumn } from "./SegmentTextColumn";

// Obyekt növünü (Ev və mənzil və s.) yaratmaq / dəyişmək
export function SegmentEditor({ segment, nextSort, equipmentOptions, onClose }: SegmentEditorProps) {
  const f = useSegmentEditor(segment, onClose);

  return (
    <Modal onClose={f.cancel} labelledBy="segment-editor-title" className="!max-w-[1180px] !p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 id="segment-editor-title" className="text-lg font-bold">{segment ? "Obyekt növünü redaktə et" : "Yeni obyekt növü"}</h2>
          <p className="muted text-xs">Saytda ana səhifədəki kart və /xidmetler/{f.ts.slug || "..."} səhifəsi</p>
        </div>
        <button type="button" onClick={f.cancel} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>

      {/* Üç sütun: sürüşmə olmadan bir ekrana sığır */}
      <form onSubmit={f.submit} className="grid gap-5 lg:grid-cols-[260px_1fr_1fr]">
        <SegmentMediaColumn segment={segment} nextSort={nextSort} picker={f.picker} position={f.position} onPosition={f.setPosition}
          equipmentOptions={equipmentOptions} equipment={f.equipment} onToggleEquipment={f.toggleEquipment} />
        <SegmentTextColumn segment={segment} ts={f.ts} />
        <SegmentListColumn segment={segment} />
        <EditorFooter onCancel={f.cancel} busy={f.pending || f.picker.uploading} className="lg:col-span-3" />
      </form>
    </Modal>
  );
}
