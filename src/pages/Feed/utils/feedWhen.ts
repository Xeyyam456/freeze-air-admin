import { formatDate } from "@/shared/utils/formatDate";
import { timeBaku } from "@/shared/utils/timeBaku";
import { todayBaku } from "@/shared/utils/todayBaku";

// Paylaşımın Bakı tarixi (YYYY-MM-DD)
export const bakuDay = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Baku" }).format(new Date(iso));

// "Bu gün 18:13" / "Dünən 09:40" / "06.11.2026 14:02"
export function feedWhen(iso: string) {
  const day = bakuDay(iso);
  const today = todayBaku();
  const yesterday = new Date(Date.parse(`${today}T00:00:00Z`) - 86400000).toISOString().slice(0, 10);
  const label = day === today ? "Bu gün" : day === yesterday ? "Dünən" : formatDate(day);
  return `${label} ${timeBaku(iso)}`;
}
