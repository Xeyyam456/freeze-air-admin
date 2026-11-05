import { Link } from "react-router";
import { SegmentDisplay } from "@/shared/components/SegmentDisplay";
import type { FlowLaneProps } from "@/types/dashboard";
import { FlowPulse } from "./FlowPulse";
import { FlowTrack } from "./FlowTrack";
import s from "./FlowBoard.module.css";

// Bir zolaq: ad (bölməyə keçid), günün sayı LCD-də, saatlar üzrə iz, son 14 günün nəbzi
export function FlowLane({ meta, events, pulse, days, range, day, now, onOpenLog }: FlowLaneProps) {
  const Icon = meta.icon;
  const count = events.length;
  return (
    <div className={`${s.lane} ${count ? "" : s.quiet}`}>
      <Link to={meta.href} className={s.label}>
        <Icon size={15} />
        <span>{meta.label}</span>
      </Link>
      <SegmentDisplay text={count > 99 ? "99" : String(count)} align="right" className={s.count} />
      <FlowTrack events={events} range={range} day={day} now={now} onOpenLog={onOpenLog} />
      <FlowPulse values={pulse} days={days} label={meta.label} />
    </div>
  );
}
