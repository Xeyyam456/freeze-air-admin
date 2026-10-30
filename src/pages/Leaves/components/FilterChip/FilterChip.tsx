import type { FilterChipProps } from "@/types/leaves";

// Tarixçə süzgəci çipi: ad + sorğu sayı
export function FilterChip({ active, label, count, onClick }: FilterChipProps) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={`flex h-9 items-center gap-2 rounded-xl px-3.5 max-sm:justify-between max-sm:px-3 max-sm:text-[13px] text-sm font-semibold transition-colors ${
        active ? "bg-[#0b1324] text-white" : "bg-surface text-muted ring-1 ring-line hover:text-ink"}`}>
      {label}<span className={`rounded-full px-1.5 text-xs tabular-nums ${active ? "bg-white/15" : "bg-bg"}`}>{count}</span>
    </button>
  );
}
