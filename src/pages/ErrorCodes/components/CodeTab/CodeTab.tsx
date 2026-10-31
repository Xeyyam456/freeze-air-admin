import { useActionState, useRef, useState } from "react";
import { Box } from "lucide-react";
import { ActionForm, Buttons, useOnSuccess } from "@/components/forms";
import { addErrorCode } from "@/services/errorCodes/codes";
import type { CodeTabProps } from "@/types/errorCodes";
import { CodeFields } from "../CodeFields";
import { ModelSelect } from "../ModelSelect";
import { Button } from "@/shared/components/Button";
import { FormField } from "@/shared/components/FormField";

// Tab: yeni xəta kodu
export function CodeTab({ models, goModels }: CodeTabProps) {
  const [state, action, pending] = useActionState(addErrorCode, null);
  const ref = useRef<HTMLFormElement>(null);
  const [modelId, setModelId] = useState(""); // seçilmiş model qalır: eyni model üçün ardıcıl kod yazmaq rahat olsun
  const [formKey, setFormKey] = useState(0);
  useOnSuccess(state, () => {
    ref.current?.reset();
    setFormKey((k) => k + 1);
  }, "Xəta kodu əlavə edildi");

  if (models.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line p-4 text-center">
        <p className="text-sm font-semibold">Hələ model yoxdur</p>
        <p className="muted mt-1 text-xs">Xəta kodu yazmaq üçün əvvəl kondisioner modelini əlavə et.</p>
        <Button type="button" onClick={goModels} size="sm" className="mt-3"><Box size={14} /> Model əlavə et</Button>
      </div>
    );
  }
  return (
    <ActionForm ref={ref} action={action} className="space-y-4">
      <FormField label="Kondisioner modeli"><ModelSelect models={models} value={modelId} onChange={setModelId} /></FormField>
      <CodeFields key={formKey} />
      <Buttons pending={pending} label="Əlavə et" />
    </ActionForm>
  );
}
