import type { TaskSummaryProps } from "@/types/tasks";
import { placeOf } from "../../utils/labels";

// Pəncərələrdə tapşırığın qısa məlumatı: yer, səbəb, altda ustalar
export function TaskSummary({ task, children }: TaskSummaryProps) {
  return (
    <div className="rounded-xl bg-bg px-4 py-3 text-sm">
      <p className="font-semibold text-primary">{placeOf(task)}</p>
      <p className="mt-0.5">{task.reason}</p>
      {children}
    </div>
  );
}
