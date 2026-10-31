import { useTransition } from "react";
import type { ActionFormProps } from "@/types/shared";

// React <form action> göndərdikdən sonra sahələri avtomatik sıfırlayır, xəta olanda da.
// Bunun qarşısını almaq üçün action-u əl ilə çağırırıq; təmizləmə yalnız uğurda (useOnSuccess) olur.
export function ActionForm({ action, className, children, ref }: ActionFormProps) {
  const [, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => action(formData));
  }

  return <form ref={ref} onSubmit={onSubmit} className={className}>{children}</form>;
}
