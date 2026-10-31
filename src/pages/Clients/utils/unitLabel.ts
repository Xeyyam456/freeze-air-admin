import { KIND, type Kind } from "@/lib/kinds";

// Kartdakı alt yazı: filial sayı, filialı olmayan şirkətdə isə ünvanı
export function unitLabel(kind: Kind, count: number, address: string | null) {
  if (kind === "company" && count === 0) return address ?? "Sabit məkan, ünvan yazılmayıb";
  return `${count} ${KIND[kind].unit}`;
}
