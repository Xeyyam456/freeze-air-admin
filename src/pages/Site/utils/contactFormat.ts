// "16.10.2026 18:41"
export function formatTime(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// Saytdakı kimi: "+994702373721" → "+994 70 237 37 21" (web/src/lib/site-settings.ts formatPhone ilə eyni)
export function formatPhone(phone: string) {
  const d = phone.replace(/\D/g, "");
  const local = d.startsWith("994") && d.length === 12 ? d.slice(3) : d.startsWith("0") && d.length === 10 ? d.slice(1) : null;
  if (!local) return phone.trim();
  return `+994 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 7)} ${local.slice(7)}`;
}
