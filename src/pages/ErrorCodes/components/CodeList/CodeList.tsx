import type { CodeListProps, ErrorCode } from "@/types/errorCodes";
import { isNoInfo } from "../../utils/isNoInfo";
import s from "./CodeList.module.css";

// Kodların siyahısı: mobildə əsas görünüş (1-ci simvola görə qruplar), böyük ekranda sözlə axtarışın nəticələri
export function CodeList({ codes, selectedId, grouped = false, onSelect }: CodeListProps) {
  if (codes.length === 0) return <p className={s.empty}>Uyğun kod tapılmadı. Başqa söz yaz və ya modeli dəyiş.</p>;

  const groups = new Map<string, ErrorCode[]>();
  for (const c of codes) {
    const key = grouped ? c.code[0] : "";
    groups.set(key, [...(groups.get(key) ?? []), c]);
  }

  return (
    <div className={s.root}>
      {[...groups].map(([key, items]) => (
        <section key={key} className={s.group}>
          {grouped && <h3 className={s.letter}>{key}<span>{items.length}</span></h3>}
          <ul className={s.list}>
            {items.map((c) => (
              <li key={c.id}>
                <button type="button" className={`${s.row} ${c.id === selectedId ? s.selected : ""}`} onClick={() => onSelect(c)}>
                  <span className={s.code}>{c.code}</span>
                  <span className={isNoInfo(c) ? s.muted : s.title}>{isNoInfo(c) ? "İzah yoxdur" : c.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
