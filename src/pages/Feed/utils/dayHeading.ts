import { formatDateAz } from "@/shared/utils/formatDateAz";
import { todayBaku } from "@/shared/utils/todayBaku";

const WEEKDAYS = ["Bazar", "Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə"];
const dayNo = (iso: string) => Math.round(Date.parse(`${iso}T00:00:00Z`) / 86400000);

// Lentdə gün başlığı (WhatsApp kimi): "Bu gün", "Dünən", son həftədə həftə günü, sonra "5 noyabr 2026"
export function dayHeading(day: string) {
  const ago = dayNo(todayBaku()) - dayNo(day);
  if (ago <= 0) return "Bu gün";
  if (ago === 1) return "Dünən";
  if (ago < 7) return WEEKDAYS[new Date(`${day}T00:00:00Z`).getUTCDay()];
  return formatDateAz(day);
}
