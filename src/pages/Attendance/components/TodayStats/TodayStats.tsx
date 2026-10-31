import type { TodayStatsProps } from "@/types/attendance";
import { Card } from "@/shared/components/Card";

// Cari ayda: bu günün 6 göstəricisi
export function TodayStats({ totals, ready }: TodayStatsProps) {
  const items = [
    { label: "Hazırda işdə", value: totals.here, cls: "text-ok" },
    { label: "İşi bitirib", value: totals.done, cls: "text-ink" },
    { label: "Bu gün icazəli", value: totals.leave, cls: "text-violet-600" },
    { label: "Bu gün hələ gəlməyib", value: totals.missing, cls: "text-ink" },
    { label: "Bu gün işdə olmayıb", value: totals.absent, cls: totals.absent ? "text-danger" : "text-ink" },
    { label: "Gözləyən icazə sorğusu", value: totals.pending, cls: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 max-xl:gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
      {items.map((x) => (
        <Card key={x.label} className="!py-3 max-xl:!px-3 max-xl:!py-2">
          <p className="muted truncate text-xs font-semibold max-xl:text-[11px]">{x.label}</p>
          <p className={`text-2xl font-extrabold max-xl:text-xl max-xl:leading-tight ${x.cls}`}>{ready ? x.value : "…"}</p>
        </Card>
      ))}
    </div>
  );
}
