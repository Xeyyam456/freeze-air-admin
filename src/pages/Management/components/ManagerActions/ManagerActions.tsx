import { Pencil, Trash2 } from "lucide-react";
import { deleteEmployee } from "@/actions/employees";
import { ConfirmButton } from "@/components/ConfirmButton";
import type { ManagerActionsProps } from "@/types/management";

// Kartın düymələri: müdir redaktə edir və silir; digər admin yalnız telefon və şəkli dəyişir (0069)
export function ManagerActions({ manager, canEdit, canContact, onEdit, onContact, light = false }: ManagerActionsProps) {
  const btn = `icon-btn !h-8 !w-8${light ? " !text-white/75 hover:!bg-white/15 hover:!text-white" : ""}`;
  if (canEdit) {
    return (
      <>
        <button type="button" onClick={onEdit} className={btn} title="Redaktə et" aria-label="Redaktə et"><Pencil size={15} /></button>
        <ConfirmButton onConfirm={() => deleteEmployee(manager.id)} className={btn} title="Rəhbəri sil"><Trash2 size={15} /></ConfirmButton>
      </>
    );
  }
  if (canContact) {
    return <button type="button" onClick={onContact} className={btn} title="Telefon və şəkli dəyiş" aria-label="Telefon və şəkli dəyiş"><Pencil size={15} /></button>;
  }
  return null;
}
