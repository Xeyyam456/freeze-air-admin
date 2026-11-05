import { Plus } from "lucide-react";
import type { CodeMatrixProps } from "@/types/errorCodes";
import { compareCodes } from "../../utils/compareCodes";
import { isNoInfo } from "../../utils/isNoInfo";
import s from "./CodeMatrix.module.css";

const sortChars = (set: Set<string>) => [...set].sort(compareCodes);

// Kod xəritəsi (admin): sətir = 1-ci simvol, sütun = 2-ci. Kliklə kod redaktorda açılır; boş xana (+) həmin kodu yaradır.
// Küncdəki yaşıl nöqtə: "Edilecək iş" yazılıb.
export function CodeMatrix({ codes, selectedId, draft, matches, onSelect, onCreate }: CodeMatrixProps) {
  const rows = sortChars(new Set(codes.map((c) => c.code[0])));
  const cols = sortChars(new Set(codes.map((c) => c.code[1])));
  const byCode = new Map(codes.map((c) => [c.code, c]));

  return (
    <div className={s.root} style={{ "--cols": cols.length } as React.CSSProperties} role="grid" aria-label="Kod xəritəsi">
      <span aria-hidden="true" />
      {cols.map((col) => <span key={col} className={s.head} aria-hidden="true">{col}</span>)}
      {rows.map((row) => (
        <div key={row} role="row" className={s.row}>
          <span className={s.head} role="rowheader">{row}</span>
          {cols.map((col) => {
            const code = row + col;
            const c = byCode.get(code);
            if (!c) {
              return (
                <button key={col} type="button" role="gridcell" className={`${s.void} ${draft === code ? s.draft : ""}`}
                  aria-label={`${code} kodunu əlavə et`} title={`${code} əlavə et`} onClick={() => onCreate(code)}>
                  {draft === code ? code : <Plus size={12} />}
                </button>
              );
            }
            const cls = [
              s.cell,
              isNoInfo(c) && s.noInfo,
              c.solution?.trim() && s.solved,
              matches && (matches.has(c.id) ? s.match : s.dim),
              c.id === selectedId && s.selected,
            ].filter(Boolean).join(" ");
            return (
              <button key={col} type="button" role="gridcell" className={cls} title={c.title} aria-selected={c.id === selectedId} onClick={() => onSelect(c)}>
                {c.code}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
