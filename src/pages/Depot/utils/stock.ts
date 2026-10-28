import type { Loss } from "@/types/depot";
import { REASONS } from "../constants/requests";
import { fmt } from "./quantity";

// Depoda minimum qalıq həddinə çatıb: depodakı tam say (materialda + parçalar) həddə bərabər və ya ondan azdır
export function isLowStock(t: { min_stock: number | null; available: number; pieces_total: number }) {
  return t.min_stock != null && t.available + t.pieces_total <= t.min_stock;
}

// "1 ədəd xarab olub · 1 ədəd itib" (eyni səbəblər toplanır)
export function lossText(list: Loss[], unit: string) {
  const by = new Map<string, number>();
  for (const l of list) by.set(l.reason ?? "other", (by.get(l.reason ?? "other") ?? 0) + (l.quantity ?? 0));
  return [...by].map(([r, n]) => `${fmt(n)} ${unit} ${(REASONS[r] ?? r).toLocaleLowerCase("az")}`).join(" · ");
}
