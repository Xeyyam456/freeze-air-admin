const p2 = (n: number) => String(n).padStart(2, "0");

// "14:32"
export function timeOf(iso: string) {
  const d = new Date(iso);
  return `${p2(d.getHours())}:${p2(d.getMinutes())}`;
}

// "17.10.2026"
export function dateOf(iso: string) {
  const d = new Date(iso);
  return `${p2(d.getDate())}.${p2(d.getMonth() + 1)}.${d.getFullYear()}`;
}
