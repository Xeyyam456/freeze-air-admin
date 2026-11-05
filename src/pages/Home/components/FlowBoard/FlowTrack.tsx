import { useNavigate } from "react-router";
import type { FlowEvent, FlowTrackProps } from "@/types/dashboard";
import { bakuHour } from "../../utils/bakuHour";
import { hhmm } from "../../utils/hhmm";
import { stackRows } from "../../utils/stackRows";
import { FLOW_LANES } from "../../constants/flowLanes";
import s from "./FlowBoard.module.css";

const ROW = 12; // bir sətrin hündürlüyü (px)

// Zolağın iz xətti: saat oxu üzrə nöqtələr (an) və xətlər (müddət). Davam edən müddət "indi"yə qədər axan ştrixlə uzanır.
export function FlowTrack({ events, range: [h0, h1], day, now, onOpenLog }: FlowTrackProps) {
  const navigate = useNavigate();
  const pos = (h: number) => `${((Math.min(Math.max(h, h0), h1) - h0) / (h1 - h0)) * 100}%`;
  const spanOf = (e: FlowEvent) => {
    const from = bakuHour(e.at, day);
    const to = e.end ? bakuHour(e.end, day) : e.ongoing && now !== null ? now : from;
    return { from, to };
  };
  const { rows, count } = stackRows(events.map((e) => {
    const { from, to } = spanOf(e);
    return { id: e.id, from, to: Math.max(to, from + 0.35) };
  }));
  const open = (e: FlowEvent) => (e.logId ? onOpenLog(e.logId) : navigate(FLOW_LANES.find((l) => l.key === e.lane)?.href ?? "/"));

  return (
    <div className={s.track} style={{ height: count * ROW + 12, "--hours": h1 - h0 } as React.CSSProperties}>
      {now !== null && now >= h0 && now <= h1 && <span className={s.nowLine} style={{ left: pos(now) }} aria-hidden="true" />}
      {events.map((e) => {
        const { from, to } = spanOf(e);
        const top = 6 + (rows.get(e.id) ?? 0) * ROW;
        const tip = `${hhmm(e.at)}${e.end ? `–${hhmm(e.end)}` : e.ongoing ? "–indi" : ""}  ${e.title}`;
        const cls = `${s.event} ${e.pending ? s.pending : ""} ${from < h0 ? s.carry : ""}`;
        return (
          <span key={e.id}>
            {to > from && (
              <span className={`${s.span} ${e.ongoing ? s.flowing : ""} ${e.pending ? s.pending : ""}`}
                style={{ left: pos(from), width: `calc(${pos(to)} - ${pos(from)})`, top: top + 4 }} aria-hidden="true" />
            )}
            <button type="button" className={cls} style={{ left: pos(from), top }} data-tip={tip} aria-label={tip} onClick={() => open(e)} />
            {e.end && to > from && <span className={`${s.endDot} ${e.pending ? s.pending : ""}`} style={{ left: pos(to), top: top + 1 }} aria-hidden="true" />}
          </span>
        );
      })}
    </div>
  );
}
