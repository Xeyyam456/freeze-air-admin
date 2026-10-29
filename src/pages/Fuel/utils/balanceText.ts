import type { BalanceTone } from "@/types/fuel";
import { azn } from "../shared/money";

// Balans = verilən − sərf: mənfi → şirkət ustaya borcludur, müsbət → artıq verilib
export function balanceText(b: number): { tone: BalanceTone; text: string } {
  const v = Math.round(b * 100) / 100;
  if (v < 0) return { tone: "debt", text: `Şirkət ${azn(-v)} borcludur` };
  if (v > 0) return { tone: "over", text: `${azn(v)} artıq verilib` };
  return { tone: "even", text: "Hesab bağlıdır" };
}
