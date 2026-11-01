import { IconButton, iconBtnClass } from "@/shared/components/IconButton";
import { Pencil, Trash2 } from "lucide-react";
import { deleteEmployee } from "@/actions/employees";
import { ConfirmButton } from "@/components/ConfirmButton";
import type { CardActionsProps } from "@/types/employees";

// Kartın düymələri (yalnız admin): redaktə et, sil
export function CardActions({ employee, onEdit }: CardActionsProps) {
  return (
    <>
      <IconButton onClick={onEdit} className="!h-8 !w-8" title="Redaktə et" aria-label="Redaktə et">
        <Pencil size={15} />
      </IconButton>
      <ConfirmButton onConfirm={() => deleteEmployee(employee.id)} className={iconBtnClass("!h-8 !w-8")} title="Ustanı sil">
        <Trash2 size={15} />
      </ConfirmButton>
    </>
  );
}
