import type { CalendarSummaryProps } from "@/types/attendance";

// Ayın xülasəsi: iş günü, işdə (+bazar), icazəli, gəlmədi
export function CalendarSummary({ summary: s }: CalendarSummaryProps) {
  const items = [
    { label: "İş günü", value: s.workdays, cls: "text-ink", sub: undefined },
    { label: "İşdə", value: s.present, cls: "text-ok", sub: s.extra ? `+${s.extra} bazar` : undefined },
    { label: "İcazəli", value: s.leave, cls: "text-violet-600", sub: undefined },
    { label: "Gəlmədi", value: s.absent, cls: s.absent ? "text-danger" : "text-ink", sub: undefined },
  ];

  return (
    <div className="mt-3 grid grid-cols-4 gap-1.5 text-center">
      {items.map((x) => (
        <div key={x.label} className="rounded-lg bg-bg py-1.5">
          <p className={`text-base font-bold ${x.cls}`}>{x.value}{x.sub && <span className="ml-1 text-[11px] font-semibold text-slate-500">{x.sub}</span>}</p>
          <p className="muted text-[11px] font-medium">{x.label}</p>
        </div>
      ))}
    </div>
  );
}
