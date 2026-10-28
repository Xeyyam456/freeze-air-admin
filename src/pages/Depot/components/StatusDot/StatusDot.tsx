import { SOFT, type Tone } from "@/pages/Depot/components/ui";

// Vəziyyət: rəngli nöqtə + yazı
export function StatusDot({ tone, label }: { tone: Tone; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${SOFT[tone]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {label}
    </span>
  );
}
