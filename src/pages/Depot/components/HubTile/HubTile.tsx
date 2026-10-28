import { ArrowRight } from "lucide-react";
import { IconTile } from "../IconTile";
import type { HubTileProps } from "@/types/depot";
import { fmt } from "../../utils/quantity";


// Ümumi baxış kafeli: rəngli ikon, başlıq, iri rəqəm, kiçik göstəricilər, (alətdə) paylanma zolağı; basanda siyahı açılır
export function HubTile({ icon, tone, title, big, unit, rows, bar, onClick }: HubTileProps) {
  const total = (bar ?? []).reduce((s, p) => s + p.n, 0);
  return (
    <button type="button" onClick={onClick}
      className="group flex flex-col rounded-3xl border border-line bg-surface p-5 text-left transition hover:-translate-y-0.5 hover:border-transparent hover:shadow-[0_18px_40px_-16px_rgba(16,24,40,0.28)]">
      <span className="flex items-center gap-3">
        <IconTile icon={icon} tone={tone} />
        <span className="flex-1 text-[17px] font-bold">{title}</span>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-bg text-muted transition group-hover:bg-primary group-hover:text-white"><ArrowRight size={17} /></span>
      </span>
      <span className="mt-5 text-[40px] font-extrabold leading-none tracking-tight tabular-nums">
        {fmt(big)}<span className="ml-2 text-base font-semibold tracking-normal text-muted">{unit}</span>
      </span>
      {bar && (
        <span className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-line">
          {total > 0 && bar.filter((p) => p.n > 0).map((p, i) => <span key={i} className={`h-full ${p.c}`} style={{ width: `${(p.n / total) * 100}%` }} />)}
        </span>
      )}
      <span className="mt-4 grid gap-1.5">
        {rows.map((r) => (
          <span key={r.label} className="flex items-center gap-2 text-[13px]">
            <span className={`h-2 w-2 shrink-0 rounded-full ${r.dot}`} />
            <span className="flex-1 text-muted">{r.label}</span>
            <b className="tabular-nums">{r.value}</b>
          </span>
        ))}
      </span>
    </button>
  );
}
