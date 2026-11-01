import { Label } from "@/shared/components/Label";
import type { LogPartProps } from "@/types/workLogs";

// Nə edib: tapşırıqdan yaranan işdə müdirin verdiyi iş (tapşırıq) və ustanın yazdığı görülən iş ayrı göstərilir
export function LogWhat({ log }: LogPartProps) {
  const task = log.tasks?.[0] ?? null; // bu iş tapşırıqdan yaranıbsa
  if (!task) return (
    <div>
      <Label >Görülən iş</Label>
      <p className="whitespace-pre-line rounded-xl border border-line p-4 text-sm leading-relaxed">{log.description}</p>
    </div>
  );
  return (
    <>
      <div>
        <Label >İş (tapşırıq)</Label>
        <p className="whitespace-pre-line rounded-xl border border-line bg-bg p-4 text-sm leading-relaxed">{task.reason}</p>
      </div>
      <div>
        <Label >Görülən iş</Label>
        {task.note
          ? <p className="whitespace-pre-line rounded-xl border border-line p-4 text-sm leading-relaxed">{task.note}</p>
          : <p className="muted rounded-xl border border-dashed border-line p-4 text-sm">Usta hələ görülən iş barədə yazmayıb.</p>}
      </div>
    </>
  );
}
