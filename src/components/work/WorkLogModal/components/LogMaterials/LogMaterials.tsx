import type { LogPartProps } from "@/types/workLogs";

// Usta bu işdə üzərindəki materialdan nə qədər işlədib (migrasiya 0060; depoda say dəyişmir)
export function LogMaterials({ log }: LogPartProps) {
  if (log.work_log_materials.length === 0) return null;
  return (
    <div>
      <span className="label">İşlədilən material</span>
      <div className="flex flex-wrap gap-2">
        {log.work_log_materials.map((m) => (
          <span key={m.id} className="rounded-lg border border-line bg-bg px-3 py-1.5 text-sm">
            <b>{m.tools?.name ?? "—"}</b> <span className="muted">· {String(m.amount).replace(".", ",")} {m.tools?.unit}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
