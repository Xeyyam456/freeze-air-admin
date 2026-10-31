import { parseCoordinates } from "@/lib/navigation";
import type { ImportRow } from "@/types/clients";
import { IMPORT_COLUMNS } from "../constants/importColumns";

// Başlıqları sadələşdir: "Ünvan" → "unvan", "Kod " → "kod"
function normalize(h: unknown) {
  return String(h ?? "")
    .trim()
    .toLowerCase()
    .replace(/ü/g, "u").replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o")
    .replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g");
}

function cell(v: unknown) {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

// Excel cədvəlini sətirlərə çevirir; başlıq səhvdirsə xəta mətni qaytarır
export function parseRows(data: unknown[][]): ImportRow[] | string {
  const header = (data[0] ?? []).map(normalize);
  const index: Record<string, number> = {};
  for (const [key, names] of Object.entries(IMPORT_COLUMNS)) {
    const i = header.findIndex((h) => names.includes(h));
    if (i >= 0) index[key] = i;
  }
  if (index.code == null || index.name == null) {
    return "Birinci sətirdə ən azı \"Kod\" və \"Ad\" sütunları olmalıdır.";
  }

  return data.slice(1)
    .map((r, i) => {
      const get = (k: string) => (index[k] != null ? cell(r[index[k]]) : null);
      const row: ImportRow = {
        line: i + 2,
        code: get("code") ?? "",
        name: get("name") ?? "",
        address: get("address"),
        phone: get("phone"),
        lat: null,
        lng: null,
      };

      const coordsText = get("coords");
      const latText = get("lat");
      const lngText = get("lng");
      const coords = coordsText
        ? parseCoordinates(coordsText)
        : latText && lngText ? parseCoordinates(`${latText}, ${lngText}`) : null;
      if ((coordsText || latText || lngText) && !coords) row.error = "Koordinat səhvdir";
      row.lat = coords?.lat ?? null;
      row.lng = coords?.lng ?? null;

      if (!row.code || !row.name) row.error = "Kod və ya ad boşdur";
      return row;
    })
    .filter((r) => r.code || r.name || r.address);
}
