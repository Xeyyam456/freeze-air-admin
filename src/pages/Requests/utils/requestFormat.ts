import { formatTime } from "@/shared/utils/formatDateTime";

// "5 dəq", "3 saat", sonra tarix
export function agoShort(iso: string) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "indicə";
  if (min < 60) return `${min} dəq`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} saat`;
  const days = Math.round(h / 24);
  return days < 7 ? `${days} gün` : formatTime(iso).slice(0, 10);
}

export const digits = (phone: string) => phone.replace(/\D/g, "");

// Addan sabit rəng: eyni adam həmişə eyni rəngdə
const TONES = ["from-[#0a7ea4] to-[#2dd4bf]", "from-[#6d5efc] to-[#0a7ea4]", "from-[#0ea5a4] to-[#2dd4bf]", "from-[#f59e0b] to-[#f97316]", "from-[#e5484d] to-[#f97316]"];
export const toneOf = (name: string) => TONES[[...name].reduce((s, c) => s + c.charCodeAt(0), 0) % TONES.length];
