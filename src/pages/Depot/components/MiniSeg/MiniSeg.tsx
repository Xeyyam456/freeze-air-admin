

// Kiçik keçid (kq | balon, işlədib | ustada qalır)
export function MiniSeg<T extends string | boolean>({ value, onChange, items, label }: { value: T; onChange: (v: T) => void; items: [T, string][]; label: string }) {
  return (
    <span className="inline-flex shrink-0 gap-0.5 rounded-lg bg-line/60 p-0.5" role="tablist" aria-label={label}>
      {items.map(([v, l]) => (
        <button key={String(v)} type="button" role="tab" aria-selected={value === v} onClick={() => onChange(v)}
          className={`h-7 rounded-md px-2.5 text-xs font-semibold transition-colors ${value === v ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
          {l}
        </button>
      ))}
    </span>
  );
}
