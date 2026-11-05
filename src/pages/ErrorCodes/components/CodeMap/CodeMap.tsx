import { Search } from "lucide-react";
import { SearchField } from "@/shared/components/SearchField";
import type { CodeMapProps } from "@/types/errorCodes";
import { CodeList } from "../CodeList";
import { CodeMatrix } from "../CodeMatrix";
import { ModelTabs } from "../ModelTabs";
import s from "./CodeMap.module.css";

// Sol tərəf: model, axtarış, "Edilecək iş" irəliləyişi və kod xəritəsi (mobildə siyahı)
export function CodeMap({ map, onPick, onCreate }: CodeMapProps) {
  const total = map.codes.length;
  const share = total ? Math.round((map.solved / total) * 100) : 0;
  const visible = map.matches ? map.codes.filter((c) => map.matches?.has(c.id)) : map.codes;
  const selectedId = map.selected?.id ?? null;

  if (map.models.length === 0) {
    return <p className={s.none}>Hələ model yoxdur. Sağdakı "Modellər" tabından kondisioner modelini əlavə et.</p>;
  }
  return (
    <div className={s.root}>
      <div className={s.bar}>
        <ModelTabs models={map.models} counts={map.counts} value={map.model?.id ?? null} onChange={map.setModelId} />
        <SearchField className={s.search}>
          <Search size={16} />
          <input value={map.query} onChange={(e) => map.setQuery(e.target.value)} placeholder="Kod və ya söz..." aria-label="Xəta kodu axtarışı" />
        </SearchField>
      </div>

      <div className={s.progress}>
        <p><b>Edilecək iş</b> {map.solved} / {total} kodda yazılıb</p>
        <span className={s.track} aria-hidden="true"><span style={{ width: `${share}%` }} /></span>
        <p className={s.legend} aria-hidden="true">
          <i className={s.keySolved} /> iş yazılıb <i className={s.keyNone} /> izahı yoxdur <i className={s.keyVoid} /> boş: kliklə əlavə et
        </p>
      </div>

      <div className={`${s.scroll} nice-scroll`}>
        <div className="max-sm:hidden">
          {total === 0
            ? <p className={s.none}>Bu modeldə hələ kod yoxdur. Sağdakı pultda kod yaz və ya Excel-dən yüklə.</p>
            : <CodeMatrix codes={map.codes} selectedId={selectedId} draft={map.draft} matches={map.matches} onSelect={onPick} onCreate={onCreate} />}
          {map.results && (
            <div className={s.results}>
              <h3>{map.results.length} uyğun kod</h3>
              <CodeList codes={map.results} selectedId={selectedId} onSelect={onPick} />
            </div>
          )}
        </div>
        <div className="sm:hidden">
          <CodeList codes={visible} selectedId={selectedId} grouped onSelect={onPick} />
        </div>
      </div>
    </div>
  );
}
