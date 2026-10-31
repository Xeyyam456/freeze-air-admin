// Saytda hazır illüstrasiyası olan avadanlıq açarları (şəkil yüklənməyibsə, onlar göstərilir).
// web/src/lib/site-content.ts → ILLUSTRATED_KEYS ilə eyni olmalıdır.
export const ILLUSTRATED_KEYS = ["split", "cassette", "floor", "ducted", "outdoor"];

// Obyekt şəkli saytda kəsiləndə görünən hissə
export const IMAGE_POSITIONS = [
  { value: "top", label: "Yuxarı" },
  { value: "center", label: "Orta" },
  { value: "bottom", label: "Aşağı" },
];
export const POSITION_CLASS: Record<string, string> = { top: "object-top", center: "object-center", bottom: "object-bottom" };
