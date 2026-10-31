import type { ColKey } from "@/types/errorCodes";

// Excel sütunlarının qəbul olunan adları (başlıq sadələşdirildikdən sonra)
export const IMPORT_COLUMNS: Record<ColKey, string[]> = {
  model: ["model", "modeli", "kondisioner modeli", "kondisioner", "model series", "model_series"],
  code: ["kod", "kodu", "xeta kodu", "error kodu", "error code", "error", "code"],
  title: ["aciqlama", "xeta aciqlamasi", "error aciqlamasi", "aciqlamasi", "title", "description"],
  solution: ["edilecek is", "edilecek ish", "edilecek isler", "is", "hell", "helli", "solution", "action"],
};
