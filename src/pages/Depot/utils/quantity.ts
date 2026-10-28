import type { PackInfo, Tool } from "@/types/depot";

// Miqdar kəsr ola bilər (0085: 1 balon = 11,3 kq); alət həmişə tam ədəddir. 2 rəqəmə yuvarlanır (11,3 × 2 = 22,6, 22,6000001 yox).
export const round2 = (n: number) => Math.round(n * 100) / 100;
// Göstəriş: "11,3" (vergüllə)
export const fmt = (n: number) => String(round2(n)).replace(".", ",");
// Yazılan mətn → ədəd: "11,3" və "11.3" ikisi də olur; boş → NaN
export const parseQty = (s: string) => (s.trim() === "" ? NaN : Number(s.trim().replace(",", ".")));

// Qablı materialda (balon...) tam qabların sayı mötərizədə: "22,6 kq (2 balon)"
export const isPacked = (p: PackInfo | null | undefined): p is { pack_name: string; pack_size: number } => !!p?.pack_name && !!p?.pack_size;
export const packSuffix = (n: number, p: PackInfo) => {
  if (!isPacked(p) || n <= 0) return "";
  const count = round2(n / p.pack_size);
  return Number.isInteger(count) ? ` (${count} ${p.pack_name})` : "";
};
// "12 metr" / "22,6 kq (2 balon)" (material) | "12" (alət)
export const withUnit = (n: number, t: Pick<Tool, "kind" | "unit" | "pack_name" | "pack_size">) => (t.kind === "material" ? `${fmt(n)} ${t.unit}${packSuffix(n, t)}` : fmt(n));
// Ustada olan miqdar: "11,3 kq (1 balon)"
export const showQty = (n: number, unit: string, p?: PackInfo | null) => `${fmt(n)} ${unit}${p ? packSuffix(n, p) : ""}`;
// Depoya qayıdan qalıq: qablıda "açıq balon", boruda "parça"
export const pieceWord = (p: PackInfo | null | undefined) => (isPacked(p) ? (p.pack_name === "ədəd" ? "açıq qab" : `açıq ${p.pack_name}`) : "parça");
// Alətdə "ədəd", materialda ölçü vahidi
export const unitOf = (t: Pick<Tool, "kind" | "unit">) => (t.kind === "material" ? t.unit : "ədəd");
