import { Pencil, Trash2 } from "lucide-react";
import { deleteTool } from "@/services/depot";
import { ConfirmButton } from "@/components/ConfirmButton";
import { toast } from "@/lib/toast";
import type { Holding, Kind, Tool } from "@/types/depot";
import { TEXT } from "../../constants/text";
import { withUnit } from "../../utils/quantity";

// Alət pəncərəsinin başlığında: redaktə və sil.
// Silmək yalnız boş olanda: qalıq Silinmə aktı ilə sıfırlanır, ustadakı geri alınır.
export function ToolHeadActions({ tool, kind, holders, empty, onEdit }: { tool: Tool; kind: Kind; holders: Holding[]; empty: boolean; onEdit: () => void }) {
  return (
    <>
      <button type="button" onClick={onEdit} className="icon-btn" title="Redaktə et" aria-label="Redaktə et"><Pencil size={16} /></button>
      {empty ? (
        <ConfirmButton onConfirm={() => deleteTool(tool.id, kind)} success={false} className="icon-btn icon-btn-danger" title={TEXT[kind].deleteTitle}>
          <Trash2 size={16} />
        </ConfirmButton>
      ) : (
        <button type="button" className="icon-btn" title={TEXT[kind].deleteTitle} aria-label={TEXT[kind].deleteTitle}
          onClick={() => toast.error(holders.length
            ? `Ustalarda ${withUnit(tool.given_out, tool)} var: əvvəl geri alın.`
            : "Depoda qalıq var: silmək üçün əvvəl «Silinmə aktı» ilə sıfırla.")}>
          <Trash2 size={16} />
        </button>
      )}
    </>
  );
}
