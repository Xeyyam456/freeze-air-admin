import type { Place } from "@/types/workLogs";

export const FIXED_GROUP = "Sabit məkanlar";
export const MAX_CUSTOM = 120;

// Siyahıda olmayan yer: yazılan mətn özü yer olur (məs. "Fərdi ev")
export function customPlace(text: string): Place {
  const t = text.trim();
  return { key: `t:${t}`, storeId: null, companyId: null, custom: t, group: "", label: t, sub: "Siyahıda olmayan yer", search: "" };
}
