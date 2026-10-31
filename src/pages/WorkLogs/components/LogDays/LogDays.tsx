import { formatDateAz } from "@/shared/utils/formatDateAz";
import type { LogDaysProps } from "@/types/workLogs";
import { WEEKDAYS } from "../../utils/logs";
import { CrewRow } from "../CrewRow";
import { SoloRow } from "../SoloRow";
import { Card } from "@/shared/components/Card";

// Günlərə görə siyahı: yapışan gün başlığı (tarix, həftənin günü, iş sayı), tək işlər və qrup sətirləri
export function LogDays({ days, filesOf, openCrews, onToggleCrew, onOpen }: LogDaysProps) {
  return (
    <Card className="min-h-0 flex-1 overflow-y-auto !p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {days === null ? (
        <p className="muted py-12 text-center text-sm">Yüklənir...</p>
      ) : days.length === 0 ? (
        <p className="muted py-12 text-center text-sm">Bu süzgəcə uyğun iş qeydi yoxdur.</p>
      ) : (
        days.map((g) => (
          <section key={g.day}>
            <h3 className="sticky top-0 z-[1] flex items-center justify-between border-b border-line bg-[#f8f9fc] px-5 py-2.5 text-xs font-bold text-muted">
              <span>{formatDateAz(g.day)}, {WEEKDAYS[new Date(`${g.day}T00:00`).getDay()]}</span>
              <span className="rounded-full bg-surface px-2 py-0.5">{g.count} iş</span>
            </h3>
            <ul>
              {g.entries.map((en) => en.type === "solo"
                ? <SoloRow key={en.log.id} l={en.log} files={filesOf(en.log)} onOpen={onOpen} />
                : <CrewRow key={en.key} names={en.names} logs={en.logs} open={openCrews.has(en.key)} onToggle={() => onToggleCrew(en.key)} filesOf={filesOf} onOpen={onOpen} />)}
            </ul>
          </section>
        ))
      )}
    </Card>
  );
}
