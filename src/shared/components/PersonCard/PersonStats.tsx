import type { PersonStatsProps } from "@/types/employees";

export function PersonStats({ stats }: PersonStatsProps) {
  return (
    <div className="mt-3 grid w-full grid-cols-2 gap-2">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl bg-bg px-3 py-1.5">
          <p className="muted text-[11px] font-semibold uppercase tracking-wide">{s.label}</p>
          <p className={`text-base font-extrabold tabular-nums leading-tight ${s.tone ?? ""}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}
