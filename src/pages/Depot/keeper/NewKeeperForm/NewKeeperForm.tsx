import { useActionState } from "react";
import { addStorekeeper } from "@/services/storekeeper/storekeeper";
import { ActionForm, Buttons, useOnSuccess } from "@/components/forms";
import type { NewKeeperFormProps } from "@/types/storekeeper";
import { Input } from "@/shared/components/Input";
import { FormField } from "@/shared/components/FormField";

// Yeni depo məsulu: əməkdaş kartı + giriş hesabı bir formada (yalnız admin görür)
export function NewKeeperForm({ onDone }: NewKeeperFormProps) {
  const [state, action, pending] = useActionState(addStorekeeper, null);
  useOnSuccess(state, onDone, "Depo məsulu əlavə edildi");
  return (
    <ActionForm action={action} className="space-y-3 rounded-xl border border-line p-3">
      <FormField label="Soyad və ad">
        <Input name="full_name" placeholder="Məmmədov Əli" required autoComplete="off" />
      </FormField>
      <FormField label="Telefon">
        <Input name="phone" placeholder="+994 50 000 00 00" />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="E-poçt (giriş)">
          <Input name="email" type="email" required autoComplete="off" />
        </FormField>
        <FormField label="Parol (min. 8)">
          <Input name="password" type="password" minLength={8} required autoComplete="new-password" />
        </FormField>
      </div>
      <Buttons pending={pending} label="Yarat" onCancel={onDone} />
    </ActionForm>
  );
}
