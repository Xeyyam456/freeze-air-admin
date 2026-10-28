import type { ReceivedBadgeProps } from "@/types/depot";

// Ustanın təsdiqi (0084): verilib, usta hələ "Aldım" basmayıb / "Almadım" deyib
export function ReceivedBadge({ h }: ReceivedBadgeProps) {
  if (h.received_at) return null;
  return h.disputed_at
    ? <span className="shrink-0 rounded-full bg-danger px-2 py-0.5 text-[11px] font-bold text-white" title="Usta bunu almadığını deyir">almadım</span>
    : <span className="shrink-0 rounded-full bg-[#fff4e0] px-2 py-0.5 text-[11px] font-bold text-[#b45309]" title="Usta hələ «Aldım» basmayıb">təsdiq gözləyir</span>;
}
