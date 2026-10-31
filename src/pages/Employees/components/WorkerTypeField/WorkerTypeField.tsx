import { useState } from "react";
import { Field } from "@/components/forms";
import { WORKER_TYPES } from "@/shared/utils/workerType";
import type { WorkerTypeFieldProps } from "@/types/employees";

// Üç seçim olduğu üçün açılan siyahı yox, keçid düymələri (seçim gizli sahədə göndərilir)
export function WorkerTypeField({ defaultValue = "master" }: WorkerTypeFieldProps) {
  const [value, setValue] = useState(defaultValue);
  return (
    <Field label="İş növü">
      <input type="hidden" name="worker_type" value={value} />
      <div className="seg w-full" role="radiogroup" aria-label="İş növü">
        {WORKER_TYPES.map((w) => (
          <button key={w.value} type="button" role="radio" aria-checked={value === w.value} aria-selected={value === w.value}
            onClick={() => setValue(w.value)} className="!h-9 !w-auto flex-1 text-sm font-semibold">
            {w.label}
          </button>
        ))}
      </div>
    </Field>
  );
}
