import { useActionState } from "react";
import { addStorekeeper } from "@/services/storekeeper/storekeeper";
import { ActionForm, Buttons, Field, useOnSuccess } from "@/components/forms";

// Yeni depo məsulu: əməkdaş kartı + giriş hesabı bir formada (yalnız admin görür)
export function NewKeeperForm({ onDone }: { onDone: () => void }) {
  const [state, action, pending] = useActionState(addStorekeeper, null);
  useOnSuccess(state, onDone, "Depo məsulu əlavə edildi");
  return (
    <ActionForm action={action} className="space-y-3 rounded-xl border border-line p-3">
      <Field label="Soyad və ad">
        <input name="full_name" placeholder="Məmmədov Əli" required autoComplete="off" className="field" />
      </Field>
      <Field label="Telefon">
        <input name="phone" placeholder="+994 50 000 00 00" className="field" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="E-poçt (giriş)">
          <input name="email" type="email" required autoComplete="off" className="field" />
        </Field>
        <Field label="Parol (min. 8)">
          <input name="password" type="password" minLength={8} required autoComplete="new-password" className="field" />
        </Field>
      </div>
      <Buttons pending={pending} label="Yarat" onCancel={onDone} />
    </ActionForm>
  );
}
