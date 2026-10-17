
import { useEffect, useRef, useState, useTransition } from "react";
import type { FormState } from "@/lib/form-state";
import { toast } from "@/lib/toast";
import { ConfirmModal } from "./ConfirmModal";

// Form nəticəsi: uğurda tost + fn (formu təmizlə və ya bağla), xətada xəta tostu.
export function useOnSuccess(state: FormState, fn: () => void = () => {}, success = "Yadda saxlanıldı") {
  const fnRef = useRef(fn);
  const msgRef = useRef(success);
  useEffect(() => {
    fnRef.current = fn;
    msgRef.current = success;
  });
  useEffect(() => {
    if (state?.ok) {
      toast.success(msgRef.current);
      fnRef.current();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);
}

type FormProps = {
  action: (formData: FormData) => void;
  className: string;
  children: React.ReactNode;
};

// React <form action> göndərdikdən sonra sahələri avtomatik sıfırlayır, xəta olanda da.
// Bunun qarşısını almaq üçün action-u əl ilə çağırırıq; təmizləmə yalnız uğurda (useOnSuccess) olur.
export function ActionForm({ action, className, children, ref }: FormProps & { ref?: React.Ref<HTMLFormElement> }) {
  const [, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => action(formData));
  }

  return <form ref={ref} onSubmit={onSubmit} className={className}>{children}</form>;
}

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

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

export function Buttons({ pending, label, onCancel }: { pending: boolean; label: string; onCancel?: () => void }) {
  return (
    <div className="flex gap-2 pt-1">
      <button type="submit" disabled={pending} className="btn btn-primary flex-1">
        {pending ? "Gözləyin..." : label}
      </button>
      {onCancel && (
        <button type="button" onClick={onCancel} className="btn btn-cancel">Ləğv et</button>
      )}
    </div>
  );
}
