import { CalendarOff, Hourglass } from "lucide-react";
import type { PendingSectionProps } from "@/types/leaves";
import { PendingCard } from "../PendingCard";
import { Card } from "@/shared/components/Card";

// Gözləyən sorğular: qərar burada
export function PendingSection({ items, yearDays, onDecide }: PendingSectionProps) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-base font-bold"><Hourglass size={18} className="text-primary" /> Gözləyən sorğular</h2>
      {items.length === 0 ? (
        <Card className="py-10 text-center max-sm:py-5">
          <span className="icon-tile mx-auto"><CalendarOff size={20} /></span>
          <p className="mt-2 text-sm font-semibold">Gözləyən sorğu yoxdur</p>
          <p className="muted text-xs">Ustalar icazəni usta panelində «İcazələrim» → «İcazə istə» ilə göndərir.</p>
        </Card>
      ) : (
        <ul className="flex flex-wrap gap-3">
          {items.map((l) => <PendingCard key={l.id} leave={l} used={yearDays.get(l.employee_id) ?? 0} onDecide={onDecide} />)}
        </ul>
      )}
    </section>
  );
}
