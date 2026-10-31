// Vəzifə sırası: müdir ən üstdə, sonra servis müdirləri, sonra qalanlar (maliyyəçi və s.)
export function rank(position: string | null) {
  const p = (position ?? "").toLocaleLowerCase("az");
  if (p === "müdir") return 0;
  if (p.includes("müdir")) return 1;
  return 2;
}
