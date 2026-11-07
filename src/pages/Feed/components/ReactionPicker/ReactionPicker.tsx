import { SmilePlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Reaction } from "@/types/feed";
import { REACTIONS } from "../../constants/reactions";

// Reaksiya seçimi: şərhin yanında gülüş ikonu; klikdə 5 emoji yuxarıda açılır, birini seçən kimi göndərilir və bağlanır.
// Artıq seçdiyini yenidən seçsə geri götürülür (ayrıca düymə yoxdur). Kənara klik və Escape bağlayır
export function ReactionPicker({ mine, onPick, down = false, left = false }: { mine: Reaction | null; onPick: (kind: Reaction) => void; down?: boolean; left?: boolean }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", away); document.removeEventListener("keydown", esc); };
  }, [open]);

  return (
    <div ref={box} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-label="Reaksiya ver" aria-expanded={open}
        className={`group grid h-8 w-8 place-items-center rounded-full transition ${open || mine ? "bg-primary/15 text-primary" : "text-muted hover:bg-surface-2 hover:text-primary"}`}>
        <SmilePlus size={17} strokeWidth={2.1} className="transition duration-300 group-hover:scale-110 group-hover:-rotate-6" />
      </button>
      {open && (
        <div role="menu" className={`absolute ${down ? "top-[calc(100%+8px)] " : "bottom-[calc(100%+8px)] "} ${left ? "left-0 origin-bottom-left" : "right-0 origin-bottom-right"} z-30 flex animate-[reactPop_180ms_cubic-bezier(0.22,1,0.36,1)] gap-1 rounded-2xl border border-line bg-surface p-1.5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)]`}>
          {REACTIONS.map((r) => (
            <button key={r.kind} type="button" role="menuitem" title={r.label} aria-label={r.label} onClick={() => { onPick(r.kind); setOpen(false); }}
              className={`grid h-11 w-11 place-items-center rounded-xl text-[26px] leading-none transition duration-200 hover:-translate-y-1 hover:scale-125 ${mine === r.kind ? "bg-primary/20" : "hover:bg-surface-2"}`}>
              {r.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
