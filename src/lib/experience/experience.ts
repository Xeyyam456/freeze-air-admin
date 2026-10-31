// İşə başlama tarixindən təcrübə: "3 il 2 ay", "5 ay", "1 aydan az".
export function experience(startDate: string | null, now = new Date()): string | null {
  if (!startDate) return null;
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime()) || start > now) return null;

  let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) months -= 1;

  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0 && rest === 0) return "1 aydan az";
  return [years && `${years} il`, rest && `${rest} ay`].filter(Boolean).join(" ");
}

// Ad və soyaddan iki hərf: "Əlizadə Xəyyam" → "ƏX"
export function initials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toLocaleUpperCase("az"))
    .join("");
}
