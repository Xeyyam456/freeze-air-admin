import { dateAz, daysSince } from "../../utils/dates";
import { STALE_DAYS } from "../../constants/limits";
import type { HeldBadgeProps } from "@/types/depot";

export function HeldBadge({ takenAt, always = false }: HeldBadgeProps) {
  const d = daysSince(takenAt);
  const stale = d >= STALE_DAYS;
  if (!stale && !always) return null;
  return (
    <span title={`Götürüb: ${dateAz(takenAt)}`} className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${stale ? "bg-[#fff4e0] text-[#b45309]" : "muted"}`}>
      {d === 0 ? "bu gün" : `${d} gün`}
    </span>
  );
}
