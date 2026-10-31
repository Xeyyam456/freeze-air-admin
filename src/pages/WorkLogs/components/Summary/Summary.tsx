import type { SummaryProps } from "@/types/workLogs";
import { Card } from "@/shared/components/Card";

export function Summary({ label, value, icon: Icon }: SummaryProps) {
  return (
    <Card className="min-w-0 !p-4 max-sm:!px-3 max-sm:!py-2.5">
      <p className="flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-muted"><Icon size={14} className="shrink-0" /> <span className="truncate">{label}</span></p>
      <p className="mt-2 text-2xl font-extrabold leading-none max-sm:mt-1 max-sm:text-xl">{value}</p>
    </Card>
  );
}
