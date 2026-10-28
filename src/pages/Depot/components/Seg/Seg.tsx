export function Seg<T extends string>({ value, onChange, items, label }: { value: T; onChange: (v: T) => void; items: readonly (readonly [T, string])[]; label: string }) {
  return (
    <div className="inline-flex shrink-0 gap-1 rounded-xl bg-line/60 p-1 max-sm:flex max-sm:w-full" role="tablist" aria-label={label}>
      {items.map(([v, l]) => (
        <button key={v} type="button" role="tab" aria-selected={value === v} onClick={() => onChange(v)}
          className={`rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition-colors max-sm:flex-1 ${value === v ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
          {l}
        </button>
      ))}
    </div>
  );
}
