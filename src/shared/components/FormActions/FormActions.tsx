// Formanın alt zolağı: "göndər" düyməsi + istəyə görə "Ləğv et" (ortaq Button-dan qurulub)
import type { FormActionsProps } from "@/types/shared";
import { Button } from "@/shared/components/Button";

export function FormActions({ pending, label, onCancel }: FormActionsProps) {
  return (
    <div className="flex gap-2 pt-1">
      <Button type="submit" disabled={pending} className="min-w-0 flex-1 max-sm:!h-8 max-sm:!px-2 max-sm:!text-xs">
        {pending ? "Gözləyin..." : label}
      </Button>
      {onCancel && (
        <Button type="button" onClick={onCancel} variant="cancel" className="max-sm:min-w-0 max-sm:flex-1 max-sm:!h-8 max-sm:!px-2 max-sm:!text-xs">Ləğv et</Button>
      )}
    </div>
  );
}
