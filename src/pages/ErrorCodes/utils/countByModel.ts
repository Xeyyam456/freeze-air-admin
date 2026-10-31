import type { ErrorCode } from "@/types/errorCodes";

// Model id → onun xəta kodlarının sayı
export function countByModel(codes: ErrorCode[]) {
  const m = new Map<number, number>();
  for (const c of codes) m.set(c.model_id, (m.get(c.model_id) ?? 0) + 1);
  return m;
}
