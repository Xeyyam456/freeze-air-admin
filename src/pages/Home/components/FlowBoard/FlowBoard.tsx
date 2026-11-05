import type { FlowBoardProps } from "@/types/dashboard";
import { FLOW_LANES } from "../../constants/flowLanes";
import { useFlow } from "../../hooks/useFlow";
import { useNowHour } from "../../hooks/useNowHour";
import { flowRange } from "../../utils/flowRange";
import { FlowAxis } from "./FlowAxis";
import { FlowHeader } from "./FlowHeader";
import { FlowLane } from "./FlowLane";
import s from "./FlowBoard.module.css";

// "Günün axını": hər məlumat növü öz zolağında, saatlar üzrə — müraciətdən işə, gəlişdən gedişə qədər.
// Bu gün açıqdırsa "indi" xətti dəqiqəbədəqiqə irəliləyir, davam edən işlər ona qədər axır.
export function FlowBoard({ onOpenLog }: FlowBoardProps) {
  const f = useFlow();
  const isToday = f.day === f.today;
  const nowHour = useNowHour(f.day);
  const now = isToday ? nowHour : null;
  const events = f.data?.events ?? [];
  const range = flowRange(events, f.day, now);

  return (
    <section className={s.board} aria-label="Günün axını">
      <FlowHeader day={f.day} isToday={isToday} total={events.length} onShift={f.shift} onToday={f.goToday} />
      <div className={s.grid}>
        <div className={s.axisRow}>
          <span />
          <span />
          <FlowAxis range={range} now={now} />
          <span className={s.pulseHead}>son 14 gün</span>
        </div>
        {FLOW_LANES.map((meta) => (
          <FlowLane key={meta.key} meta={meta} events={events.filter((e) => e.lane === meta.key)}
            pulse={f.data?.pulse[meta.key] ?? Array(14).fill(0)} days={f.data?.days ?? []}
            range={range} day={f.day} now={now} onOpenLog={onOpenLog} />
        ))}
      </div>
      <p className={s.legend}>
        <i className={s.keyDot} /> hadisə <i className={s.keySpan} /> müddət <i className={s.keyFlow} /> davam edir <i className={s.keyWait} /> cavab gözləyir
      </p>
    </section>
  );
}
