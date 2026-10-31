import { MONTHS_AZ } from "../monthsAz";

// "2026-10-16" → "16 oktyabr 2026"
export function formatDateAz(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return `${d} ${MONTHS_AZ[m - 1].toLocaleLowerCase("az")} ${y}`;
}
