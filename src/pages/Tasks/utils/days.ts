const pad = (n: number) => String(n).padStart(2, "0");
// Yerli tarix "YYYY-MM-DD"
export const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export function shiftDay(day: string, delta: number) {
  const d = new Date(`${day}T00:00`);
  d.setDate(d.getDate() + delta);
  return iso(d);
}
