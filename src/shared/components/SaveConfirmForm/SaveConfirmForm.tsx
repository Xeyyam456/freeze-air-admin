import { useRef, useState, useTransition } from "react";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import type { FormProps } from "@/types/shared";

// Redaktə forması: "Yadda saxla" basanda əvvəl təsdiq modalı açılır, təsdiqdən sonra göndərilir.
export function SaveConfirmForm({ action, className, children }: FormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOpen(true);
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className={className}>
      {children}
      <ConfirmModal
        open={open}
        title="Məlumatların doğruluğunu təsdiq edirsinizmi?"
        message="Dəyişikliklər yadda saxlanılacaq və bütün işçilər yeni məlumatı görəcək."
        confirmLabel="Bəli, yadda saxla"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          if (!formRef.current) return;
          const formData = new FormData(formRef.current);
          startTransition(() => action(formData));
        }}
      />
    </form>
  );
}
