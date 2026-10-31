import { ArrowRight, ClipboardList } from "lucide-react";
import type { LogsCardProps } from "@/types/dashboard";
import { EmptyState } from "../EmptyState";
import { LogRow } from "./LogRow";

// Bu gün: iş qeydləri (son 4; hamısı pəncərədə)
export function LogsCard({ d, onOpen, onAll }: LogsCardProps) {
  return (
    <section className="card flex h-[374px] flex-col max-sm:h-auto">
      <div className="flex items-center justify-between gap-3">
        <h2 className="card-title flex items-center gap-2"><ClipboardList size={18} className="text-primary" /> İş qeydləri</h2>
        <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">Bu gün: {d ? d.todayTotal : "–"}</span>
      </div>
      {!d ? (
        <p className="muted mt-6 text-sm">Yüklənir...</p>
      ) : d.logs.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Bu gün iş qeydi yoxdur" text="Ustalar bu gün iş əlavə edəndə burada görünəcək." />
      ) : (
        <ul className="mt-3 min-h-0 flex-1 space-y-1 overflow-hidden">
          {d.logs.map((l) => <LogRow key={l.id} log={l} files={d.logFiles.get(l.id)} onOpen={() => onOpen(l.id)} />)}
        </ul>
      )}
      {!!d?.logs.length && (
        <button type="button" onClick={onAll} className="link mt-auto inline-flex w-fit items-center gap-1 pt-4 text-sm font-semibold">
          Hamısına bax <ArrowRight size={14} />
        </button>
      )}
    </section>
  );
}
