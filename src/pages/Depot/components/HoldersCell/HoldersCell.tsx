import { useEffect, useRef, useState } from "react";
import { rectOf, viewport } from "@/lib/zoom";
import { createPortal } from "react-dom";
import { ChevronDown, Clock } from "lucide-react";
import { useEscapeLayer } from "@/shared/hooks/useEscapeLayer";
import type { Holding, HoldersCellProps } from "@/types/depot";
import { HeldBadge } from "../HeldBadge";
import { ReceivedBadge } from "../ReceivedBadge";
import { holdQty } from "../../utils/holdQty";

// Siyahıda "Kimdədir": həmişə "N usta" düyməsi (1 usta olsa da), basanda ad siyahısı açılır
// (10 adı sətirə sığdırmaq olmur). Siyahı cədvəlin sürüşməsindən kəsilməsin deyə body-də açılır.
export function HoldersCell({ holders, tool }: HoldersCellProps) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  useEscapeLayer(() => setPos(null), pos !== null);
  useEffect(() => {
    if (!pos) return;
    const close = () => setPos(null);
    const onDown = (e: MouseEvent) => {
      if (!(e.target as Element).closest("[data-holders-pop]") && !btn.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [pos]);

  const oldest = holders.reduce<Holding | null>((o, h) => (!o || h.taken_at < o.taken_at ? h : o), null);
  const unconfirmed = holders.some((h) => !h.received_at);
  return (
    <>
      <span className="flex items-center gap-2">
        <button ref={btn} type="button" aria-expanded={pos !== null} aria-haspopup="true"
          onClick={(e) => {
            e.stopPropagation();
            if (pos) return setPos(null);
            const r = rectOf(e.currentTarget);
            setPos({ top: r.bottom + 6, left: Math.min(r.left, viewport().w - 320) });
          }}
          className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-primary-soft px-2.5 text-[13px] font-semibold text-primary transition-colors hover:bg-[#dbe8ff]">
          {holders.length} usta <ChevronDown size={13} className={pos ? "rotate-180" : ""} />
        </button>
        {unconfirmed && <Clock size={14} className="shrink-0 text-[#b45309]" aria-label="Təsdiq gözləyən var" />}
        {oldest && <HeldBadge takenAt={oldest.taken_at} />}
      </span>
      {pos && createPortal(
        <div data-holders-pop style={{ top: pos.top, left: pos.left }}
          className="fixed z-50 w-[19rem] rounded-xl border border-line bg-surface p-1.5 shadow-[0_16px_40px_rgba(16,24,40,0.18)]">
          <ul className="nice-scroll max-h-64 overflow-y-auto">
            {holders.map((h) => (
              <li key={h.id} className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px]">
                <span className="min-w-0 flex-1 truncate font-semibold">{h.employees?.full_name ?? "?"}</span>
                <span className="tabular-nums text-primary">{holdQty(h, tool)}</span>
                <ReceivedBadge h={h} />
                <HeldBadge takenAt={h.taken_at} always />
              </li>
            ))}
          </ul>
        </div>,
        document.body,
      )}
    </>
  );
}
