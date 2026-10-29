import { fmt } from "../quantity";
import { isLowStock } from "../stock";
import { REASONS } from "../../constants/requests";
import type { Hue, LossRow, Tool } from "@/types/depot";


export function status(t: Tool): { v: string; h: Hue } {
  const n = t.available + t.pieces_total;
  if (n === 0 && t.given_out + t.in_repair === 0) return { v: "Qalmayıb", h: "red" };
  if (n === 0) return { v: "Hamısı ustada", h: "blue" };
  if (isLowStock(t)) return { v: "Azalıb", h: "amber" };
  return { v: "Depoda var", h: "green" };
}
export const reasonHue: Record<string, Hue> = { broken: "red", lost: "amber", stolen: "red", used: "slate", other: "violet" };
export const lossesOf = (losses: LossRow[], id: number, unit: string) => {
  const by = new Map<string, number>();
  for (const l of losses.filter((x) => x.tool_id === id)) by.set(l.reason ?? "other", (by.get(l.reason ?? "other") ?? 0) + (l.quantity ?? 0));
  return [...by].map(([r, q]) => `${fmt(q)} ${unit} ${(REASONS[r] ?? r).toLocaleLowerCase("az")}`).join(", ");
};
