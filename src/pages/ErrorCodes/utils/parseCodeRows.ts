import { norm } from "@/shared/utils/norm";
import type { ColKey, ParsedCodeRow } from "@/types/errorCodes";
import { IMPORT_COLUMNS } from "../constants/importColumns";

const cell = (v: unknown) => {
  const s = v == null ? "" : String(v).trim();
  return s === "" ? null : s;
};

// Excel cədvəlini sətirlərə çevirir; başlıq səhvdirsə xəta mətni qaytarır
export function parseCodeRows(data: unknown[][]): ParsedCodeRow[] | string {
  const header = (data[0] ?? []).map((h) => norm(String(h ?? "").trim()));
  const index: Partial<Record<ColKey, number>> = {};
  for (const [key, names] of Object.entries(IMPORT_COLUMNS) as [ColKey, string[]][]) {
    const i = header.findIndex((h) => names.includes(h));
    if (i >= 0) index[key] = i;
  }
  if (index.model == null || index.code == null || index.title == null) return "Birinci sətirdə \"Model\", \"Kod\" və \"Açıqlama\" sütunları olmalıdır.";

  return data.slice(1)
    .map((r, i) => {
      const get = (k: ColKey) => (index[k] != null ? cell(r[index[k]!]) : null);
      const row: ParsedCodeRow = { line: i + 2, model: get("model") ?? "", code: get("code") ?? "", title: get("title") ?? "", solution: get("solution") };
      if (!row.model || !row.code || !row.title) row.error = "Model, kod və ya açıqlama boşdur";
      return row;
    })
    .filter((r) => r.model || r.code || r.title || r.solution);
}
