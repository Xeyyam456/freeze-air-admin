import { Pencil, Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deleteErrorCode } from "@/services/errorCodes/codes";
import type { CodeRowProps } from "@/types/errorCodes";

// Cədvəlin sətri: klik → redaktə; sağda redaktə və sil (kliki sətrə keçmir)
export function CodeRow({ code: c, modelName, onEdit }: CodeRowProps) {
  return (
    <tr onClick={onEdit} className="cursor-pointer border-t border-line align-top transition-colors hover:bg-primary-soft/40">
      <td className="px-4 py-3 text-[13px] font-semibold max-sm:hidden">{modelName}</td>
      <td className="px-4 py-3 max-sm:px-3"><span className="rounded-lg bg-danger-soft px-2 py-1 text-xs font-extrabold text-danger">{c.code}</span></td>
      <td className="px-4 py-3 text-[13px] max-sm:px-1"><span className="line-clamp-3">{c.title}</span><span className="muted mt-0.5 block text-[11px] font-semibold sm:hidden">{modelName}</span></td>
      <td className="px-4 py-3 text-[13px] max-2xl:hidden"><span className="muted line-clamp-2 whitespace-pre-line">{c.solution ?? "—"}</span></td>
      <td className="px-2 py-2 max-sm:px-1" onClick={(e) => e.stopPropagation()}>
        <span className="flex justify-end gap-0 max-sm:[&_.icon-btn]:!h-8 max-sm:[&_.icon-btn]:!w-8">
          <button type="button" onClick={onEdit} className="icon-btn" title="Redaktə et" aria-label="Redaktə et"><Pencil size={15} /></button>
          <ConfirmButton onConfirm={() => deleteErrorCode(c.id)} success={false} className="icon-btn icon-btn-danger" title="Sil"
            question={`"${c.code}" xəta kodu silinəcək.`}>
            <Trash2 size={15} />
          </ConfirmButton>
        </span>
      </td>
    </tr>
  );
}
