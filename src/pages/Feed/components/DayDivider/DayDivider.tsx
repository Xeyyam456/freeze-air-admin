import { dayHeading } from "../../utils/dayHeading";

// Gün başlığı + həmin günün sayı ("Bu gün · 20 akt"; hər gün sıfırdan): ortada həb, sürüşəndə yuxarıda yapışır (WhatsApp kimi)
export function DayDivider({ day, label }: { day: string; label: string }) {
  return (
    <div className="sticky top-[var(--header-h)] z-10 flex justify-center py-1">
      <span className="rounded-full border border-line bg-surface/90 px-3.5 py-1 text-xs font-bold text-muted shadow-sm backdrop-blur">{dayHeading(day)} · {label}</span>
    </div>
  );
}
