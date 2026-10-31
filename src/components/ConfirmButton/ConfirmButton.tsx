
import { useState, useTransition } from "react";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { toast } from "@/lib/toast";
import type { ConfirmButtonProps } from "@/types/shared";

// Silmə düyməsi: basanda təsdiq modalı açılır, sonra nəticə tostla bildirilir.
export function ConfirmButton({
  onConfirm, children, className, title,
  question = "Bu əməliyyatı geri qaytarmaq olmur.",
  confirmLabel = "Bəli, sil",
  success = "Silindi",
}: ConfirmButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className} title={title} aria-label={title}>
        {children}
      </button>
      <ConfirmModal
        open={open}
        tone="danger"
        title={title ? `${title}?` : "Silmək istədiyinə əminsən?"}
        message={question}
        confirmLabel={confirmLabel}
        pending={pending}
        onCancel={() => setOpen(false)}
        onConfirm={() => startTransition(async () => {
          try {
            await onConfirm();
            if (success) toast.success(success);
          } catch (e) {
            // onConfirm xəta atıbsa onun mətni (məs. bazadan), yoxsa ümumi mesaj
            toast.error(e instanceof Error && e.message ? e.message : "Alınmadı. Yenidən yoxlayın.");
          }
          setOpen(false);
        })}
      />
    </>
  );
}
