// İş növü: işə qəbul zamanı seçilir (bazada employees.worker_type; saytın "Ustalarımız" səhifəsi növə görə sayır)
export const WORKER_TYPES = [
  { value: "master", label: "Usta" },
  { value: "assistant", label: "Köməkçi" },
  { value: "driver", label: "Sürücü" },
] as const;

export function workerTypeLabel(type: string | null | undefined) {
  return WORKER_TYPES.find((w) => w.value === type)?.label ?? "Usta";
}
