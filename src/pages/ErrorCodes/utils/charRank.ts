import { CHAR_ORDER } from "../constants/charOrder";

// Simvolun sıradakı yeri (naməlum simvol sona)
export function charRank(ch: string) {
  const i = CHAR_ORDER.indexOf(ch.toUpperCase());
  return i < 0 ? CHAR_ORDER.length : i;
}
