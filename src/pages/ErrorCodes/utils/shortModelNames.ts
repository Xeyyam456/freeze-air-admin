import type { Model } from "@/types/errorCodes";

// Bütün modellərin adı eyni sözlə başlayırsa (marka), düymədə o söz atılır: "Daikin VRV" → "VRV"
export function shortModelNames(models: Model[]) {
  const first = models[0]?.name.split(" ")[0] ?? "";
  const shared = models.length > 1 && models.every((m) => m.name.startsWith(`${first} `));
  return new Map(models.map((m) => [m.id, shared ? m.name.slice(first.length + 1) : m.name]));
}
