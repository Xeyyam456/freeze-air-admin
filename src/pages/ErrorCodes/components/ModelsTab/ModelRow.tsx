import { Box, Pencil, Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deleteModel } from "@/services/errorCodes/models";
import type { ModelRowProps } from "@/types/errorCodes";

// Modelin sətri: ad, kod sayı, adını dəyiş, sil (kodları ilə birlikdə)
export function ModelRow({ model: m, count, onRename }: ModelRowProps) {
  return (
    <li className="flex items-center gap-2 rounded-xl bg-bg px-3 py-2">
      <Box size={15} className="shrink-0 text-primary" />
      <span className="min-w-0 flex-1 truncate text-sm font-semibold">{m.name}</span>
      <span className="muted shrink-0 text-xs">{count} kod</span>
      <button type="button" onClick={onRename} className="icon-btn !h-7 !w-7" title="Adını dəyiş" aria-label="Adını dəyiş"><Pencil size={14} /></button>
      <ConfirmButton onConfirm={() => deleteModel(m.id)} success={false} className="icon-btn icon-btn-danger !h-7 !w-7" title="Modeli sil"
        question={count > 0 ? `"${m.name}" modeli və onun ${count} xəta kodu silinəcək.` : `"${m.name}" modeli silinəcək.`}>
        <Trash2 size={14} />
      </ConfirmButton>
    </li>
  );
}
